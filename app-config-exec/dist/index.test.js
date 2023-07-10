"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("@app-config/main");
const utils_1 = require("@app-config/utils");
const test_utils_1 = require("@app-config/test-utils");
const node_1 = require("@app-config/node");
const _1 = __importDefault(require("."));
const defaultOptions = {
    environmentExtensions: (0, main_1.defaultEnvExtensions)().concat((0, _1.default)()),
    parsingExtensions: (0, main_1.defaultExtensions)().concat((0, _1.default)()),
};
describe('execParsingExtension', () => {
    it('reads from command as root level string', async () => {
        process.env.APP_CONFIG = JSON.stringify({
            $exec: 'echo test123',
        });
        const { fullConfig } = await (0, main_1.loadUnvalidatedConfig)(defaultOptions);
        expect(fullConfig).toEqual('test123');
    });
    it('reads from command within nested object options', async () => {
        process.env.APP_CONFIG = JSON.stringify({
            $exec: { command: 'echo test123' },
        });
        const { fullConfig } = await (0, main_1.loadUnvalidatedConfig)(defaultOptions);
        expect(fullConfig).toEqual('test123');
    });
    // FIXME: tests don't work on windows
    if (!utils_1.isWindows) {
        it('reads JSON as string by default', async () => {
            process.env.APP_CONFIG = JSON.stringify({
                $exec: { command: `echo '{"test": true}'` },
            });
            const { fullConfig } = await (0, main_1.loadUnvalidatedConfig)(defaultOptions);
            expect(fullConfig).toBe('{"test": true}');
        });
        it('parses JSON if parseOutput true', async () => {
            process.env.APP_CONFIG = JSON.stringify({
                $exec: { command: `echo '{"test": true}'`, parseOutput: true },
            });
            const { fullConfig } = await (0, main_1.loadUnvalidatedConfig)(defaultOptions);
            expect(fullConfig).toMatchObject({ test: true });
        });
        it('trims whitespace by default', async () => {
            process.env.APP_CONFIG = JSON.stringify({
                $exec: { command: `echo '  test123\n'` },
            });
            const { fullConfig } = await (0, main_1.loadUnvalidatedConfig)(defaultOptions);
            expect(fullConfig).toBe('test123');
        });
        it('reads raw output if trimWhitespace false', async () => {
            process.env.APP_CONFIG = JSON.stringify({
                $exec: { command: `echo '  test123'`, trimWhitespace: false },
            });
            const { fullConfig } = await (0, main_1.loadUnvalidatedConfig)(defaultOptions);
            expect(fullConfig).toBe('  test123\n');
        });
        it('does not fail on stderr by default', async () => {
            process.env.APP_CONFIG = JSON.stringify({
                $exec: {
                    command: `node -e 'process.stdout.write("stdout"); process.stderr.write("stderr");'`,
                },
            });
            const { fullConfig } = await (0, main_1.loadUnvalidatedConfig)(defaultOptions);
            expect(fullConfig).toEqual('stdout');
        });
    }
    it('fails on stderr when failOnStderr true', async () => {
        process.env.APP_CONFIG = JSON.stringify({
            $exec: {
                command: `node -e 'process.stdout.write("stdout"); process.stderr.write("stderr");'`,
                failOnStderr: true,
            },
        });
        const action = async () => {
            await (0, main_1.loadUnvalidatedConfig)(defaultOptions);
        };
        await expect(action()).rejects.toThrow();
    });
    it('fails if options is not a string or object', async () => {
        process.env.APP_CONFIG = JSON.stringify({
            $exec: 12345,
        });
        const action = async () => {
            await (0, main_1.loadUnvalidatedConfig)(defaultOptions);
        };
        await expect(action()).rejects.toThrow();
    });
    it('fails if options dont include command', async () => {
        process.env.APP_CONFIG = JSON.stringify({
            $exec: {},
        });
        await expect((0, main_1.loadUnvalidatedConfig)(defaultOptions)).rejects.toThrow();
    });
    it('invalid command fails', async () => {
        process.env.APP_CONFIG = JSON.stringify({
            $exec: { command: 'non-existing-command' },
        });
        const action = async () => {
            await (0, main_1.loadUnvalidatedConfig)(defaultOptions);
        };
        await expect(action()).rejects.toThrow();
    });
    it('reads from command as root level string', async () => {
        process.env.APP_CONFIG = JSON.stringify({
            $exec: 'echo test123',
        });
        const { fullConfig } = await (0, main_1.loadUnvalidatedConfig)(defaultOptions);
        expect(fullConfig).toEqual('test123');
    });
    it('loads file relative to app-config', () => (0, test_utils_1.withTempFiles)({
        'config.yml': `
          $exec: node ./foo.js
        `,
        'foo.js': `
          console.log("foo bar");
        `,
    }, async (inDir) => {
        const source = new node_1.FileSource(inDir('config.yml'));
        expect(await source.readToJSON([(0, _1.default)()])).toEqual('foo bar');
    }));
});
//# sourceMappingURL=index.test.js.map