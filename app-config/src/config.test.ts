import { loadConfig } from './config';
import { withTempFiles } from './test-util';

describe('Configuration Loading', () => {
  it('loads configuration from a YAML file', async () => {
    await withTempFiles(
      {
        '.app-config.yml': `foo: 42`,
      },
      async (inDir) => {
        const { fullConfig } = await loadConfig({ directory: inDir('.') });

        expect(fullConfig).toEqual({ foo: 42 });
      },
    );
  });

  it('loads configuration from a TOML file', async () => {
    await withTempFiles(
      {
        '.app-config.toml': `foo = 42`,
      },
      async (inDir) => {
        const { fullConfig } = await loadConfig({ directory: inDir('.') });

        expect(fullConfig).toEqual({ foo: 42 });
      },
    );
  });

  it('loads configuration from a JSON file', async () => {
    await withTempFiles(
      {
        '.app-config.json': `{ "foo": 42 }`,
      },
      async (inDir) => {
        const { fullConfig } = await loadConfig({ directory: inDir('.') });

        expect(fullConfig).toEqual({ foo: 42 });
      },
    );
  });

  it('loads configuration from a JSON5 file', async () => {
    await withTempFiles(
      {
        '.app-config.json5': `{ foo: 42 }`,
      },
      async (inDir) => {
        const { fullConfig } = await loadConfig({ directory: inDir('.') });

        expect(fullConfig).toEqual({ foo: 42 });
      },
    );
  });

  it('loads configuration from environment variable', async () => {
    await withTempFiles(
      {
        '.app-config.yml': `foo: 42`,
      },
      async (inDir) => {
        process.env.APP_CONFIG = 'foo: 88';
        const { fullConfig } = await loadConfig({ directory: inDir('.') });

        expect(fullConfig).toEqual({ foo: 88 });
      },
    );
  });

  it('loads environment specific configuration file', async () => {
    await withTempFiles(
      {
        '.app-config.yml': `env: default`,
        '.app-config.dev.yml': `env: development`,
        '.app-config.production.yml': `env: production`,
      },
      async (inDir) => {
        expect((await loadConfig({ directory: inDir('.') })).fullConfig).toEqual({
          env: 'default',
        });

        process.env.NODE_ENV = 'development';
        expect((await loadConfig({ directory: inDir('.') })).fullConfig).toEqual({
          env: 'development',
        });

        process.env.NODE_ENV = 'production';
        expect((await loadConfig({ directory: inDir('.') })).fullConfig).toEqual({
          env: 'production',
        });
      },
    );
  });

  it('loads secrets configuration file', async () => {
    await withTempFiles(
      {
        '.app-config.yml': `base: present`,
        '.app-config.secrets.yml': `secret: present`,
      },
      async (inDir) => {
        expect((await loadConfig({ directory: inDir('.') })).fullConfig).toEqual({
          base: 'present',
          secret: 'present',
        });
      },
    );
  });
});

describe('CI Environment Variable Extension', () => {
  it('merges APP_CONFIG_EXTEND values', async () => {
    await withTempFiles(
      {
        '.app-config.yml': `foo: 42`,
      },
      async (inDir) => {
        process.env.APP_CONFIG_EXTEND = JSON.stringify({ bar: 88 });
        const { fullConfig } = await loadConfig({ directory: inDir('.') });

        expect(fullConfig).toEqual({ foo: 42, bar: 88 });
      },
    );
  });

  it('merges APP_CONFIG_CI values', async () => {
    await withTempFiles(
      {
        '.app-config.yml': `foo: 42`,
      },
      async (inDir) => {
        process.env.APP_CONFIG_CI = JSON.stringify({ bar: 88 });
        const { fullConfig } = await loadConfig({ directory: inDir('.') });

        expect(fullConfig).toEqual({ foo: 42, bar: 88 });
      },
    );
  });

  it('ignores APP_CONFIG_CI if overriden', async () => {
    await withTempFiles(
      {
        '.app-config.yml': `foo: 42`,
      },
      async (inDir) => {
        process.env.APP_CONFIG_CI = JSON.stringify({ bar: 88 });
        const { fullConfig } = await loadConfig({
          directory: inDir('.'),
          extensionEnvironmentVariableNames: [],
        });

        expect(fullConfig).toEqual({ foo: 42 });
      },
    );
  });
});

describe('V1 Compatibility', () => {
  it('uses special app-config property for $extends', async () => {
    await withTempFiles(
      {
        '.app-config.yml': `
          app-config: { extends: "base-file.yml" }
          foo: 88
        `,
        'base-file.yml': `
          foo: 42
          bar: foo
        `,
      },
      async (inDir) => {
        const { fullConfig } = await loadConfig({ directory: inDir('.') });

        expect(fullConfig).toEqual({ foo: 88, bar: 'foo' });
      },
    );
  });

  it('uses special app-config property for $extendsOptional', async () => {
    await withTempFiles(
      {
        '.app-config.yml': `
          app-config: { extendsOptional: "base-file.yml" }
          foo: 88
        `,
        'base-file.yml': `
          foo: 42
          bar: foo
        `,
      },
      async (inDir) => {
        const { fullConfig } = await loadConfig({ directory: inDir('.') });

        expect(fullConfig).toEqual({ foo: 88, bar: 'foo' });
      },
    );

    await withTempFiles(
      {
        '.app-config.yml': `
          app-config: { extendsOptional: "base-file.yml" }
          foo: 88
        `,
      },
      async (inDir) => {
        const { fullConfig } = await loadConfig({ directory: inDir('.') });

        expect(fullConfig).toEqual({ foo: 88 });
      },
    );
  });

  it('uses special app-config property for $override', async () => {
    await withTempFiles(
      {
        '.app-config.yml': `
          app-config: { override: "base-file.yml" }
          foo: 88
        `,
        'base-file.yml': `
          foo: 42
          bar: foo
        `,
      },
      async (inDir) => {
        const { fullConfig } = await loadConfig({ directory: inDir('.') });

        expect(fullConfig).toEqual({ foo: 42, bar: 'foo' });
      },
    );
  });

  it('uses special app-config property for $overrideOptional', async () => {
    await withTempFiles(
      {
        '.app-config.yml': `
          app-config: { overrideOptional: "base-file.yml" }
          foo: 88
        `,
        'base-file.yml': `
          foo: 42
          bar: foo
        `,
      },
      async (inDir) => {
        const { fullConfig } = await loadConfig({ directory: inDir('.') });

        expect(fullConfig).toEqual({ foo: 42, bar: 'foo' });
      },
    );

    await withTempFiles(
      {
        '.app-config.yml': `
          app-config: { overrideOptional: "base-file.yml" }
          foo: 88
        `,
      },
      async (inDir) => {
        const { fullConfig } = await loadConfig({ directory: inDir('.') });

        expect(fullConfig).toEqual({ foo: 88 });
      },
    );
  });

  it('uses an ambiguous path in special app-config property', async () => {
    await withTempFiles(
      {
        '.app-config.yml': `
          app-config: { extends: "base-file" }
          foo: 88
        `,
        'base-file.yml': `
          foo: 42
          bar: foo
        `,
      },
      async (inDir) => {
        const { fullConfig } = await loadConfig({ directory: inDir('.') });

        expect(fullConfig).toEqual({ foo: 88, bar: 'foo' });
      },
    );
  });
});