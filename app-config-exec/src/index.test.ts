import { defaultEnvExtensions, defaultExtensions, loadUnvalidatedConfig } from '@app-config/main';
import execParsingExtension from '.';

const defaultOptions = {
  environmentExtensions: defaultEnvExtensions().concat(execParsingExtension()),
  parsingExtensions: defaultExtensions().concat(execParsingExtension()),
};

describe('execParsingExtension', () => {
  it('reads from command as root level string', async () => {
    process.env.APP_CONFIG = JSON.stringify({
      $exec: 'echo test123',
    });

    const { fullConfig } = await loadUnvalidatedConfig(defaultOptions);

    expect(fullConfig).toEqual('test123');
  });

  it('reads from command within nested object options', async () => {
    process.env.APP_CONFIG = JSON.stringify({
      $exec: { command: 'echo test123' },
    });

    const { fullConfig } = await loadUnvalidatedConfig(defaultOptions);

    expect(fullConfig).toEqual('test123');
  });

  it('reads JSON as string by default', async () => {
    process.env.APP_CONFIG = JSON.stringify({
      $exec: { command: `echo '{"test": true}'` },
    });

    const { fullConfig } = await loadUnvalidatedConfig(defaultOptions);

    expect(fullConfig).toBe('{"test": true}');
  });

  it('parses JSON if parseOutput true', async () => {
    process.env.APP_CONFIG = JSON.stringify({
      $exec: { command: `echo '{"test": true}'`, parseOutput: true },
    });

    const { fullConfig } = await loadUnvalidatedConfig(defaultOptions);

    expect(fullConfig).toMatchObject({ test: true });
  });

  it('trims whitespace by default', async () => {
    process.env.APP_CONFIG = JSON.stringify({
      $exec: { command: `echo '  test123\n'` },
    });

    const { fullConfig } = await loadUnvalidatedConfig(defaultOptions);

    expect(fullConfig).toBe('test123');
  });

  it('reads raw output if trimWhitespace false', async () => {
    process.env.APP_CONFIG = JSON.stringify({
      $exec: { command: `echo '  test123'`, trimWhitespace: false },
    });

    const { fullConfig } = await loadUnvalidatedConfig(defaultOptions);

    expect(fullConfig).toBe('  test123\n');
  });

  it('does not fail on stderr by default', async () => {
    process.env.APP_CONFIG = JSON.stringify({
      $exec: {
        command: `node -e 'process.stdout.write("stdout"); process.stderr.write("stderr");'`,
      },
    });

    const { fullConfig } = await loadUnvalidatedConfig(defaultOptions);

    expect(fullConfig).toEqual('stdout');
  });

  it('fails on stderr when failOnStderr true', async () => {
    process.env.APP_CONFIG = JSON.stringify({
      $exec: {
        command: `node -e 'process.stdout.write("stdout"); process.stderr.write("stderr");'`,
        failOnStderr: true,
      },
    });

    const action = async () => {
      await loadUnvalidatedConfig(defaultOptions);
    };

    await expect(action()).rejects.toThrow();
  });

  it('fails if options is not a string or object', async () => {
    process.env.APP_CONFIG = JSON.stringify({
      $exec: 12345,
    });

    const action = async () => {
      await loadUnvalidatedConfig(defaultOptions);
    };

    await expect(action()).rejects.toThrow();
  });

  it('fails if options dont include command', async () => {
    process.env.APP_CONFIG = JSON.stringify({
      $exec: {},
    });

    await expect(loadUnvalidatedConfig(defaultOptions)).rejects.toThrow();
  });

  it('invalid command fails', async () => {
    process.env.APP_CONFIG = JSON.stringify({
      $exec: { command: 'non-existing-command' },
    });

    const action = async () => {
      await loadUnvalidatedConfig(defaultOptions);
    };

    await expect(action()).rejects.toThrow();
  });
});