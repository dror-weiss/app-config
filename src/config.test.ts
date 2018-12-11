import { FileType } from './file-loader';
import { loadConfig, loadConfigSync, ConfigSource } from './config';
import { withFakeFiles } from './test-util';

test('load env config', async () => {
  process.env.APP_CONFIG = `
    [foo]
    bar = true
  `;

  const { config, secrets, fileType, source } = await loadConfig();

  expect(config).toEqual({
    foo: {
      bar: true,
    },
  });

  expect(secrets).toBe(undefined);
  expect(fileType).toBe(FileType.TOML);
  expect(source).toBe(ConfigSource.EnvVar);

  delete process.env.APP_CONFIG;
});

test('load env sync', async () => {
  process.env.APP_CONFIG = `
    [foo]
    bar = true
  `;

  const { config, secrets, fileType, source } = loadConfigSync();

  expect(config).toEqual({
    foo: {
      bar: true,
    },
  });

  expect(secrets).toBe(undefined);
  expect(fileType).toBe(FileType.TOML);
  expect(source).toBe(ConfigSource.EnvVar);

  delete process.env.APP_CONFIG;
});

test('load app config file', async () => {
  await withFakeFiles([
    [
      '.app-config.toml',
      `
      [to]
      bar = "foo"
      `,
    ],
  ], async (dir) => {
    const { config, secrets, fileType, source } = await loadConfig(dir);

    expect(source).toBe(ConfigSource.File);
    expect(fileType).toBe(FileType.TOML);
    expect(secrets).toEqual({});
    expect(config).toEqual({
      to: { bar: 'foo' },
    });
  });
});

test('load non dotfile config file', async () => {
  await withFakeFiles([
    [
      'app-config.toml',
      `
      bar = "foo"
      `,
    ],
  ], async (dir) => {
    const { config, secrets, fileType, source } = await loadConfig(dir);

    expect(source).toBe(ConfigSource.File);
    expect(fileType).toBe(FileType.TOML);
    expect(secrets).toEqual({});
    expect(config).toEqual({
      bar: 'foo',
    });
  });
});

test('load secrets file', async () => {
  await withFakeFiles([
    [
      '.app-config.toml',
      `
      [to]
      bar = "foo"
      `,
    ],
    [
      '.app-config.secrets.toml',
      `
      password = "pwd"
      `,
    ],
  ], async (dir) => {
    const { config, secrets } = await loadConfig(dir);

    expect(secrets).toEqual({ password: 'pwd' });
    expect(config).toEqual({
      to: { bar: 'foo' },
      password: 'pwd',
    });
  });
});

test('load config sync', async () => {
  await withFakeFiles([
    [
      '.app-config.toml',
      `
      [to]
      bar = "foo"
      `,
    ],
  ], async (dir) => {
    const { config, secrets, fileType, source } = loadConfigSync(dir);

    expect(source).toBe(ConfigSource.File);
    expect(fileType).toBe(FileType.TOML);
    expect(secrets).toEqual({});
    expect(config).toEqual({
      to: { bar: 'foo' },
    });
  });
});