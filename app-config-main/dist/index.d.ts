import type { ValidateFunction } from 'ajv';
import { AppConfigError } from '@app-config/core';
import { ConfigLoadingOptions } from '@app-config/config';
import { SchemaLoadingOptions } from '@app-config/schema';
export interface ExportedConfig {
}
/** Tried to read app-config value before it was loaded */
export declare class AccessingAppConfig extends AppConfigError {
}
/**
 * Reads and validates app-config, using the default loading strategy.
 * Same as `loadValidatedConfig` but stores loaded config in the `config` export.
 */
export declare function loadConfig(options?: ConfigLoadingOptions, schemaOptions?: SchemaLoadingOptions): Promise<ExportedConfig>;
/**
 * Singleton for loaded configuration, when `loadConfig` has completed successfully.
 *
 * Reading properties on this object before `loadConfig` completes will throw errors.
 */
export declare const config: ExportedConfig;
export default config;
/**
 * ONLY available when using @app-config/webpack. Validates configuration using AJV.
 */
export declare const validateConfig: ValidateFunction<ExportedConfig>;
export { Json } from '@app-config/utils';
export { ParsedValue, ParsedValueMetadata, ParsingExtension, ParsingExtensionTransform, ConfigSource, LiteralSource, CombinedSource, FallbackSource, FileType, stringify, filePathAssumedType, parseRawString, } from '@app-config/core';
export { setLogLevel, LogLevel } from '@app-config/logging';
export { loadValidatedConfig, loadUnvalidatedConfig, ConfigLoadingOptions, } from '@app-config/config';
export { loadSchema, SchemaLoadingOptions } from '@app-config/schema';
export { loadMetaConfig } from '@app-config/meta';
export { currentEnvironment, defaultAliases, FileSource, FlexibleFileSource, EnvironmentSource, } from '@app-config/node';
export { environmentVariableSubstitution, envDirective, extendsDirective, extendsSelfDirective, overrideDirective, } from '@app-config/extensions';
export { default as encryptedDirective } from '@app-config/encryption';
export { defaultExtensions, defaultEnvExtensions, defaultMetaExtensions, } from '@app-config/default-extensions';
/** @hidden Please don't rely on this. */
export declare function resetConfigInternal(): void;
/**
 * Overrides the configuration internally, setting it to the provided override.
 */
export declare function mockConfig(override: ExportedConfig): () => void;
