import { join, dirname, extname, isAbsolute } from 'path';
import { pathExists } from 'fs-extra';
import { isObject, Json } from './common';
import { currentEnvironment, defaultAliases, EnvironmentAliases } from './environment';
import { ParsedValue, ParsedValueMetadata, ParsingExtension } from './parsed-value';
import { FileSource } from './config-source';
import { decryptValue, DecryptedSymmetricKey } from './encryption';
import { AppConfigError, NotFoundError, FailedToSelectSubObject } from './errors';
import { logger } from './logging';

export const defaultExtensions = [
  v1Compat(),
  envDirective(),
  extendsDirective(),
  overrideDirective(),
  encryptedDirective(),
  environmentVariableSubstitution(),
];

/** Uses another file as a "base", and extends on top of it */
export function extendsDirective(): ParsingExtension {
  return fileReferenceDirective('$extends', { shouldMerge: true });
}

/** Uses another file as overriding values, layering them on top of current file */
export function overrideDirective(): ParsingExtension {
  return fileReferenceDirective('$override', { shouldOverride: true });
}

/** Looks up an environment-specific value ($env) */
export function envDirective(aliases: EnvironmentAliases = defaultAliases): ParsingExtension {
  const environment = currentEnvironment(aliases);

  return (value, [_, key]) => {
    if (key === '$env') {
      return (parse) => {
        if (!isObject(value)) {
          throw new AppConfigError('An $env directive was used with a non-object value');
        }

        if (!environment) {
          if (value.default) return parse(value.default, { shouldFlatten: true });

          throw new AppConfigError(
            `An $env directive was used, but current environment (eg. NODE_ENV) is undefined`,
          );
        }

        for (const [envName, envValue] of Object.entries(value)) {
          if (envName === environment || aliases[envName] === environment) {
            return parse(envValue, { shouldFlatten: true });
          }
        }

        if ('default' in value) {
          return parse(value.default, { shouldFlatten: true });
        }

        const found = Object.keys(value).join(', ');

        throw new AppConfigError(
          `An $env directive was used, but none matched the current environment (wanted ${environment}, saw [${found}])`,
        );
      };
    }

    return false;
  };
}

/** Decrypts inline encrypted values */
export function encryptedDirective(symmetricKey?: DecryptedSymmetricKey): ParsingExtension {
  return (value) => {
    if (typeof value === 'string' && value.startsWith('enc:')) {
      return async (parse) => {
        const decrypted = await decryptValue(value, symmetricKey);

        return parse(decrypted, { fromSecrets: true, parsedFromEncryptedValue: true });
      };
    }

    return false;
  };
}

/** Substitues environment variables found in strings (similar to bash variable substitution) */
export function environmentVariableSubstitution(
  aliases: EnvironmentAliases = defaultAliases,
): ParsingExtension {
  const performAllSubstitutions = (text: string): string => {
    let output = text;

    /* eslint-disable-next-line no-constant-condition */
    while (true) {
      // this regex matches:
      //   $FOO
      //   ${FOO}
      //   ${FOO:-fallback}
      //   ${FOO:-${FALLBACK}}
      //
      // var name is group 1 || 2
      // fallback value is group 3
      // https://regex101.com/r/6ZMmx7/3
      const match = /\$(?:([a-zA-Z_]\w+)|(?:{([a-zA-Z_]\w+)(?::- *(.*?) *)?}))/g.exec(output);

      if (!match) break;

      const fullMatch = match[0];
      const varName = match[1] || match[2];
      const fallback = match[3];

      if (varName) {
        const env = process.env[varName];

        if (env !== undefined) {
          output = output.replace(fullMatch, env);
        } else if (fallback !== undefined) {
          // we'll recurse again, so that ${FOO:-${FALLBACK}} -> ${FALLBACK} -> value
          output = performAllSubstitutions(output.replace(fullMatch, fallback));
        } else if (varName === 'APP_CONFIG_ENV') {
          const envType = currentEnvironment(aliases);

          if (!envType) {
            throw new AppConfigError(`Could not find environment variable ${varName}`);
          }

          // there's a special case for APP_CONFIG_ENV, which is always the envType
          output = output.replace(fullMatch, envType);
        } else {
          throw new AppConfigError(`Could not find environment variable ${varName}`);
        }
      }
    }

    logger.verbose(`Performed $substitute for "${text}" -> "${output}"`);

    return output;
  };

  return (value, [_, key]) => {
    if (key === '$subsitute') logger.warn('Noticed a typo! Key of $subsitute was found.');

    if (key === '$substitute' || key === '$subs') {
      return (parse) => {
        if (typeof value !== 'string')
          throw new AppConfigError('$substitute expects a string value');

        return parse(performAllSubstitutions(value), { shouldFlatten: true });
      };
    }

    return false;
  };
}

/** V1 app-config compatibility */
export function v1Compat(): ParsingExtension {
  return (value, [_, key]) => {
    if (key === 'app-config' && isObject(value)) {
      return async (parse, _, ctx) => {
        if (ctx instanceof FileSource) {
          logger.warn(
            `Using V1 compatibility layer for special 'app-config' property in ${ctx.filePath}! This functionality is deprecated and may be removed in the future.`,
          );
        } else {
          logger.warn(
            `Using V1 compatibility layer for special 'app-config' property! This functionality is deprecated and may be removed in the future.`,
          );
        }

        const resolveAmbiguousFilename = async (filepath: string) => {
          let resolvedPath = filepath;

          // resolve filepaths that are relative to the current FileSource
          if (ctx instanceof FileSource) {
            resolvedPath = join(dirname(ctx.filePath), filepath);
          }

          switch (extname(resolvedPath)) {
            case '.yml':
            case '.yaml':
            case '.json':
            case '.json5':
            case '.toml':
              return resolvedPath;
            default: {
              if (await pathExists(`${resolvedPath}.yml`)) return `${resolvedPath}.yml`;
              if (await pathExists(`${resolvedPath}.yaml`)) return `${resolvedPath}.yaml`;
              if (await pathExists(`${resolvedPath}.json`)) return `${resolvedPath}.json`;
              if (await pathExists(`${resolvedPath}.json5`)) return `${resolvedPath}.json5`;
              if (await pathExists(`${resolvedPath}.toml`)) return `${resolvedPath}.toml`;

              return resolvedPath;
            }
          }
        };

        // TODO: multiple properties defined

        if ('extends' in value) {
          return parse(
            { $extends: await resolveAmbiguousFilename(value.extends as string) },
            { shouldMerge: true },
          );
        }

        if ('extendsOptional' in value) {
          return parse(
            {
              $extends: {
                path: await resolveAmbiguousFilename(value.extendsOptional as string),
                optional: true,
              },
            },
            { shouldMerge: true },
          );
        }

        if ('override' in value) {
          return parse(
            { $override: await resolveAmbiguousFilename(value.override as string) },
            { shouldOverride: true },
          );
        }

        if ('overrideOptional' in value) {
          return parse(
            {
              $override: {
                path: await resolveAmbiguousFilename(value.overrideOptional as string),
                optional: true,
              },
            },
            { shouldOverride: true },
          );
        }

        return parse(value);
      };
    }

    return false;
  };
}

// common logic for $extends and $override
function fileReferenceDirective(keyName: string, meta: ParsedValueMetadata): ParsingExtension {
  return (value, [_, key]) => {
    if (key !== keyName) return false;

    return async (parse, _, context, extensions) => {
      const retrieveFile = async (filepath: string, subselector?: string, isOptional = false) => {
        let resolvedPath = filepath;

        // resolve filepaths that are relative to the current FileSource
        if (!isAbsolute(filepath) && context instanceof FileSource) {
          resolvedPath = join(dirname(context.filePath), filepath);
        }

        logger.verbose(`Loading file for ${keyName}: ${resolvedPath}`);

        const source = new FileSource(resolvedPath);

        const parsed = await source.read(extensions).catch((error) => {
          if (error instanceof NotFoundError && isOptional) {
            return ParsedValue.literal({});
          }

          throw error;
        });

        if (subselector) {
          const found = parsed.property(subselector.split('.'));

          if (!found) {
            throw new FailedToSelectSubObject(`Failed to select ${subselector} in ${resolvedPath}`);
          }

          return found;
        }

        return parsed;
      };

      const forOptions = async (options: Json) => {
        const parsed = (await parse(options)).toJSON();

        if (typeof parsed === 'string') {
          return retrieveFile(parsed);
        }

        if (!isObject(parsed)) {
          throw new AppConfigError(`${keyName} was provided an invalid option`);
        }

        const { path, optional, select } = parsed;

        if (!path || typeof path !== 'string') {
          throw new AppConfigError(`Invalid ${keyName} filepath found`);
        }

        if (select !== undefined && typeof select !== 'string') {
          throw new AppConfigError(`Invalid ${keyName} select found`);
        }

        if (optional !== undefined && typeof optional !== 'boolean') {
          throw new AppConfigError(`Invalid ${keyName} optional found`);
        }

        return retrieveFile(path, select, optional);
      };

      if (Array.isArray(value)) {
        let acc = ParsedValue.literal({});

        for (const ext of value) {
          acc = ParsedValue.merge(acc, await forOptions(ext));
        }

        return acc.assignMeta(meta);
      }

      const parsed = await forOptions(value);

      return parsed.assignMeta(meta);
    };
  };
}