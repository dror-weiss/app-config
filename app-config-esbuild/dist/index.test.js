"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_utils_1 = require("@app-config/test-utils");
const esbuild_1 = require("esbuild");
const index_1 = __importDefault(require("./index"));
it('loads config correctly', () => (0, test_utils_1.withTempFiles)({
    '.app-config.schema.yml': `
        type: object
        additionalProperties: true
      `,
    '.app-config.yml': `
        foo: bar
      `,
    'a.js': `
        import config from '@app-config/main';
        console.log(config);
      `,
}, async (inDir) => {
    const res = await (0, esbuild_1.build)({
        entryPoints: [inDir('a.js')],
        plugins: [(0, index_1.default)({ loadingOptions: { directory: inDir('.') } })],
        bundle: true,
        minify: true,
        write: false,
    });
    expect(res.outputFiles[0].text).toMatchSnapshot();
}));
it('fails when config is incorrect', () => (0, test_utils_1.withTempFiles)({
    '.app-config.schema.yml': `
        type: object
        additionalProperties: false
      `,
    '.app-config.yml': `
        foo: bar
      `,
    'a.js': `
        import config from '@app-config/main';
        console.log(config);
      `,
}, async (inDir) => {
    await expect((0, esbuild_1.build)({
        entryPoints: [inDir('a.js')],
        plugins: [(0, index_1.default)({ loadingOptions: { directory: inDir('.') } })],
        bundle: true,
        minify: true,
        write: false,
    })).rejects.toThrow('error: [plugin: @app-config/esbuild] Config is invalid: config should NOT have additional properties');
}));
it('loads validation function', () => (0, test_utils_1.withTempFiles)({
    '.app-config.schema.yml': `
        type: object
        additionalProperties: false
        properties:
          foo: { type: string }
      `,
    '.app-config.yml': `
        foo: bar
      `,
    'a.js': `
        import { validateConfig } from '@app-config/main';

        validateConfig({ foo: 12 })
      `,
}, async (inDir) => {
    const res = await (0, esbuild_1.build)({
        entryPoints: [inDir('a.js')],
        plugins: [(0, index_1.default)({ loadingOptions: { directory: inDir('.') } })],
        bundle: true,
        minify: true,
        write: false,
    });
    expect(res.outputFiles[0].text).toMatchSnapshot();
}));
it('loads currentEnvironment', () => (0, test_utils_1.withTempFiles)({
    '.app-config.schema.yml': `
        type: object
        additionalProperties: false
        properties:
          foo: { type: string }
      `,
    '.app-config.yml': `
        foo: bar
      `,
    'a.js': `
        import { currentEnvironment } from '@app-config/main';

        console.log(currentEnvironment())
      `,
}, async (inDir) => {
    const res = await (0, esbuild_1.build)({
        entryPoints: [inDir('a.js')],
        plugins: [(0, index_1.default)({ loadingOptions: { directory: inDir('.') } })],
        bundle: true,
        minify: true,
        write: false,
    });
    expect(res.outputFiles[0].text).toMatchSnapshot();
}));
it('loads with noBundledConfig', () => (0, test_utils_1.withTempFiles)({
    '.app-config.schema.yml': `
        type: object
        additionalProperties: false
        properties:
          foo: { type: string }
      `,
    'a.js': `
        import { config, validateConfig } from '@app-config/main';

        validateConfig(config);
      `,
}, async (inDir) => {
    const res = await (0, esbuild_1.build)({
        entryPoints: [inDir('a.js')],
        plugins: [
            (0, index_1.default)({ schemaLoadingOptions: { directory: inDir('.') }, noBundledConfig: true }),
        ],
        bundle: true,
        minify: true,
        write: false,
    });
    expect(res.outputFiles[0].text).toMatchSnapshot();
}));
it('loads with noBundledConfig and no validation function', () => (0, test_utils_1.withTempFiles)({
    '.app-config.schema.yml': `
        type: object
        additionalProperties: false
        properties:
          foo: { type: string }
      `,
    'a.js': `
        import { config } from '@app-config/main';

        console.log(config);
      `,
}, async (inDir) => {
    const res = await (0, esbuild_1.build)({
        entryPoints: [inDir('a.js')],
        plugins: [
            (0, index_1.default)({
                schemaLoadingOptions: { directory: inDir('.') },
                noBundledConfig: true,
                injectValidationFunction: false,
            }),
        ],
        bundle: true,
        minify: true,
        write: false,
    });
    expect(res.outputFiles[0].text).toMatchSnapshot();
}));
//# sourceMappingURL=index.test.js.map