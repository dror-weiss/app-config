"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rollup_1 = require("rollup");
const test_utils_1 = require("@app-config/test-utils");
const plugin_commonjs_1 = __importDefault(require("@rollup/plugin-commonjs"));
const index_1 = __importDefault(require("./index"));
describe('Rollup Plugin', () => {
    let logSpy;
    beforeEach(() => {
        jest.clearAllMocks();
        logSpy = jest.spyOn(console, 'log').mockImplementation();
    });
    it('processes app-config', () => (0, test_utils_1.withTempFiles)({
        '.app-config.yml': `
          foo: https://example.com
          bar: baz
        `,
        '.app-config.schema.yml': `
          type: object
          properties:
            foo:
              type: string
              format: uri
        `,
        'entry.js': `
          import config, { validateConfig } from '@app-config/main';

          validateConfig(config);
          console.log(config);
        `,
    }, async (inDir) => {
        const bundle = await (0, rollup_1.rollup)({
            input: inDir('entry.js'),
            plugins: [
                (0, index_1.default)({ loadingOptions: { directory: inDir('.') } }),
                // commonjs plugin is required when we use ajv-formats, but not otherwise
                (0, plugin_commonjs_1.default)(),
            ],
        });
        const { output } = await bundle.generate({});
        expect(output).toHaveLength(1);
        expect(output[0].code).toMatchSnapshot();
        // avoid polluting the global namespace
        const globalThis = {}; // eslint-disable-line
        // we specially want to `eval` the generated code to make sure it wasn't messed up
        eval(output[0].code); // eslint-disable-line no-eval
        expect(logSpy).toHaveBeenLastCalledWith({ foo: 'https://example.com', bar: 'baz' });
    }));
    it('processes empty app-config', () => (0, test_utils_1.withTempFiles)({
        '.app-config.yml': ``,
        '.app-config.schema.yml': ``,
        'entry.js': `
          import config from '@app-config/main';

          console.log(config);
        `,
    }, async (inDir) => {
        const bundle = await (0, rollup_1.rollup)({
            input: inDir('entry.js'),
            plugins: [(0, index_1.default)({ loadingOptions: { directory: inDir('.') } })],
        });
        const { output } = await bundle.generate({});
        expect(output).toHaveLength(1);
        expect(output[0].code).toMatchSnapshot();
        // avoid polluting the global namespace
        const globalThis = {}; // eslint-disable-line
        // we specially want to `eval` the generated code to make sure it wasn't messed up
        eval(output[0].code); // eslint-disable-line no-eval
        expect(logSpy).toHaveBeenLastCalledWith({});
    }));
    it('fails without app-config', () => (0, test_utils_1.withTempFiles)({
        'entry.js': `
          import config from '@app-config/main';
          console.log(config);
        `,
    }, async (inDir) => {
        await expect((0, rollup_1.rollup)({
            input: inDir('entry.js'),
            plugins: [(0, index_1.default)({ loadingOptions: { directory: inDir('.') } })],
        })).rejects.toThrowError('Could not load @app-config/main');
    }));
});
//# sourceMappingURL=index.test.js.map