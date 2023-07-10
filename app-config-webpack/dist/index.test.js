"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const webpack_1 = __importDefault(require("webpack"));
const html_webpack_plugin_1 = __importDefault(require("html-webpack-plugin"));
const logging_1 = require("@app-config/logging");
const index_1 = __importStar(require("./index"));
const examplesDir = (0, path_1.resolve)(__dirname, '../../examples');
const frontendProjectExampleDir = (0, path_1.join)(examplesDir, 'frontend-webpack-project');
jest.setTimeout(30000);
describe('frontend-webpack-project example', () => {
    process.chdir(frontendProjectExampleDir);
    const createOptions = (options, production = false) => ({
        mode: production ? 'production' : 'development',
        entry: (0, path_1.join)(frontendProjectExampleDir, 'src/index.ts'),
        output: {
            filename: 'main.js',
            path: (0, path_1.resolve)(frontendProjectExampleDir, 'dist'),
        },
        plugins: [new html_webpack_plugin_1.default(), new index_1.default(options)],
        module: {
            rules: [{ test: index_1.regex, use: { loader: index_1.loader, options } }],
        },
    });
    it('builds the project without header injection', async () => {
        await new Promise((done, reject) => {
            (0, webpack_1.default)([createOptions({})], (err, stats) => {
                if (err)
                    return reject(err);
                if (!stats)
                    return reject(new Error('no stats'));
                if (stats.hasErrors())
                    reject(stats.toString());
                const { children } = stats.toJson({ source: true });
                const [{ modules = [] }] = children || [];
                expect(modules.some(({ source }) => source === null || source === void 0 ? void 0 : source.includes('const configValue = {"externalApiUrl":"https://example.com"};'))).toBe(true);
                done();
            });
        });
    });
    it('should throw an error if html-webpack-plugin is not available and headerInjection is true', () => {
        process.env.APP_CONFIG = JSON.stringify({ externalApiUrl: 'https://localhost:3999' });
        jest.isolateModules(async () => {
            jest.mock('html-webpack-plugin', () => {
                throw new Error('html-webpack-plugin not found');
            });
            const writeMsg = jest.fn();
            logging_1.logger.setWriter(writeMsg);
            logging_1.logger.setLevel(logging_1.LogLevel.Verbose);
            try {
                await new Promise((done, reject) => {
                    (0, webpack_1.default)([createOptions({ headerInjection: true })], (err, stats) => {
                        if (err)
                            return reject(err);
                        if (!stats)
                            return reject(new Error('no stats'));
                        if (stats.hasErrors())
                            reject(stats.toString());
                        done();
                    });
                });
            }
            catch (err) {
                expect(writeMsg).toHaveBeenCalledTimes(3);
                expect(writeMsg).toHaveBeenCalledWith('[app-config][ERROR] html-webpack-plugin not found\n');
                expect(writeMsg).toHaveBeenCalledWith('[app-config][ERROR] Failed to resolve html-webpack-plugin\n');
                expect(writeMsg).toHaveBeenCalledWith('[app-config][ERROR] Either include the module in your dependencies and enable the webpack plugin, or set headerInjection to false in your configuration.\n');
            }
        });
    });
    it('reads environment variable for app-config', async () => {
        process.env.APP_CONFIG = JSON.stringify({ externalApiUrl: 'https://localhost:3999' });
        await new Promise((done, reject) => {
            (0, webpack_1.default)([createOptions({})], (err, stats) => {
                if (err)
                    return reject(err);
                if (!stats)
                    return reject(new Error('no stats'));
                if (stats.hasErrors())
                    reject(stats.toString());
                const { children } = stats.toJson({ source: true });
                const [{ modules = [] }] = children || [];
                expect(modules.some(({ source }) => source === null || source === void 0 ? void 0 : source.includes('const configValue = {"externalApiUrl":"https://localhost:3999"};'))).toBe(true);
                done();
            });
        });
    });
    it('doesnt use window._appConfig if using noGlobal', async () => {
        process.env.APP_CONFIG = JSON.stringify({ externalApiUrl: 'https://localhost:3999' });
        await new Promise((done, reject) => {
            (0, webpack_1.default)([createOptions({ noGlobal: true })], (err, stats) => {
                if (err)
                    return reject(err);
                if (!stats)
                    return reject(new Error('no stats'));
                if (stats.hasErrors())
                    reject(stats.toString());
                const { children } = stats.toJson({ source: true });
                const [{ modules = [] }] = children || [];
                expect(modules.some(({ source }) => source === null || source === void 0 ? void 0 : source.includes('const config = {"externalApiUrl":"https://localhost:3999"};'))).toBe(true);
                expect(modules.some(({ source }) => source === null || source === void 0 ? void 0 : source.includes('_appConfig '))).toBe(false);
                done();
            });
        });
    });
    it('uses custom app config regex', async () => {
        process.env.APP_CONFIG = JSON.stringify({ externalApiUrl: 'https://localhost:3999' });
        await new Promise((done, reject) => {
            (0, webpack_1.default)([createOptions({ intercept: /@app-config\/main/ })], (err, stats) => {
                if (err)
                    return reject(err);
                if (!stats)
                    return reject(new Error('no stats'));
                if (stats.hasErrors())
                    reject(stats.toString());
                const { children } = stats.toJson({ source: true });
                const [{ modules = [] }] = children || [];
                expect(modules.some(({ source }) => source === null || source === void 0 ? void 0 : source.includes('const configValue = {"externalApiUrl":"https://localhost:3999"};'))).toBe(true);
                done();
            });
        });
    });
    it('throws validation errors', async () => {
        process.env.APP_CONFIG = JSON.stringify({ externalApiUrl: 'not a uri' });
        await expect(new Promise((done, reject) => {
            (0, webpack_1.default)([createOptions({})], (err, stats) => {
                if (err)
                    return reject(err);
                if (!stats)
                    return reject(new Error('no stats'));
                if (stats.hasErrors())
                    reject(stats.toString());
                done();
            });
        })).rejects.toMatch('config/externalApiUrl should match format "uri"');
    });
    it('uses custom loading options to read a specific environment variable', async () => {
        process.env.MY_CONFIG = JSON.stringify({ externalApiUrl: 'https://localhost:9782' });
        await new Promise((done, reject) => {
            (0, webpack_1.default)([createOptions({ loading: { environmentVariableName: 'MY_CONFIG' } })], (err, stats) => {
                if (err)
                    return reject(err);
                if (!stats)
                    return reject(new Error('no stats'));
                if (stats.hasErrors())
                    reject(stats.toString());
                const { children } = stats.toJson({ source: true });
                const [{ modules = [] }] = children || [];
                expect(modules.some(({ source }) => source === null || source === void 0 ? void 0 : source.includes('const configValue = {"externalApiUrl":"https://localhost:9782"};'))).toBe(true);
                done();
            });
        });
    });
    it('fills in currentEnvironment function', async () => {
        process.env.APP_CONFIG = JSON.stringify({ externalApiUrl: 'https://localhost:3999' });
        await new Promise((done, reject) => {
            (0, webpack_1.default)([createOptions({}, true)], (err, stats) => {
                if (err)
                    return reject(err);
                if (!stats)
                    return reject(new Error('no stats'));
                if (stats.hasErrors())
                    reject(stats.toString());
                const { children } = stats.toJson({ source: true });
                const [{ modules = [] }] = children || [];
                expect(modules.some(({ source }) => source === null || source === void 0 ? void 0 : source.includes('export function currentEnvironment()'))).toBe(true);
                expect(modules.some(({ source }) => source === null || source === void 0 ? void 0 : source.includes('return globalNamespace._appConfigEnvironment || "test";'))).toBe(true);
                done();
            });
        });
    });
    it('fills in currentEnvironment function with custom environment', async () => {
        process.env.APP_CONFIG = JSON.stringify({ externalApiUrl: 'https://localhost:3999' });
        process.env.APP_CONFIG_ENV = 'foobar';
        await new Promise((done, reject) => {
            (0, webpack_1.default)([createOptions({}, true)], (err, stats) => {
                if (err)
                    return reject(err);
                if (!stats)
                    return reject(new Error('no stats'));
                if (stats.hasErrors())
                    reject(stats.toString());
                const { children } = stats.toJson({ source: true });
                const [{ modules = [] }] = children || [];
                expect(modules.some(({ source }) => source === null || source === void 0 ? void 0 : source.includes('export function currentEnvironment()'))).toBe(true);
                expect(modules.some(({ source }) => source === null || source === void 0 ? void 0 : source.includes('return globalNamespace._appConfigEnvironment || "foobar";'))).toBe(true);
                done();
            });
        });
    });
    it('uses custom options for currentEnvironment', async () => {
        process.env.APP_CONFIG = JSON.stringify({ externalApiUrl: 'https://localhost:3999' });
        process.env.APP_CONFIG_ENV = 'test';
        await new Promise((done, reject) => {
            (0, webpack_1.default)([createOptions({ loading: { environmentOverride: 'foobar' } }, true)], (err, stats) => {
                if (err)
                    return reject(err);
                if (!stats)
                    return reject(new Error('no stats'));
                if (stats.hasErrors())
                    reject(stats.toString());
                const { children } = stats.toJson({ source: true });
                const [{ modules = [] }] = children || [];
                expect(modules.some(({ source }) => source === null || source === void 0 ? void 0 : source.includes('export function currentEnvironment()'))).toBe(true);
                expect(modules.some(({ source }) => source === null || source === void 0 ? void 0 : source.includes('return globalNamespace._appConfigEnvironment || "foobar";'))).toBe(true);
                done();
            });
        });
    });
    it('fills in undefined for currentEnvironment', async () => {
        process.env.APP_CONFIG = JSON.stringify({ externalApiUrl: 'https://localhost:3999' });
        process.env.APP_CONFIG_ENV = '';
        await new Promise((done, reject) => {
            (0, webpack_1.default)([createOptions({}, true)], (err, stats) => {
                if (err)
                    return reject(err);
                if (!stats)
                    return reject(new Error('no stats'));
                if (stats.hasErrors())
                    reject(stats.toString());
                const { children } = stats.toJson({ source: true });
                const [{ modules = [] }] = children || [];
                expect(modules.some(({ source }) => source === null || source === void 0 ? void 0 : source.includes('export function currentEnvironment()'))).toBe(true);
                expect(modules.some(({ source }) => source === null || source === void 0 ? void 0 : source.includes('return undefined;'))).toBe(true);
                done();
            });
        });
    });
    it.skip('does not bundle the validateConfig function', async () => {
        process.env.APP_CONFIG = JSON.stringify({ externalApiUrl: 'https://localhost:3999' });
        await new Promise((done, reject) => {
            (0, webpack_1.default)([createOptions({}, true)], (err, stats) => {
                if (err)
                    return reject(err);
                if (!stats)
                    return reject(new Error('no stats'));
                if (stats.hasErrors())
                    reject(stats.toString());
                const { children } = stats.toJson({ source: true });
                const [{ modules = [] }] = children || [];
                expect(modules.some(({ source }) => source === null || source === void 0 ? void 0 : source.includes('validateConfig'))).toBe(false);
                done();
            });
        });
    });
    it('builds the project with noBundledConfig', async () => {
        process.env.APP_CONFIG = 'null';
        process.env.APP_CONFIG_ENV = 'test';
        await new Promise((done, reject) => {
            (0, webpack_1.default)([createOptions({ noBundledConfig: true })], (err, stats) => {
                if (err)
                    return reject(err);
                if (!stats)
                    return reject(new Error('no stats'));
                if (stats.hasErrors())
                    reject(stats.toString());
                const { children } = stats.toJson({ source: true });
                const [{ modules = [] }] = children || [];
                expect(modules.some(({ source }) => source === null || source === void 0 ? void 0 : source.includes('Config is not loaded in _appConfig'))).toBe(true);
                done();
            });
        });
    });
});
describe('regex', () => {
    it('matches the correct packages', () => {
        expect(index_1.regex.exec('@app-config/main')).toBeTruthy();
        expect(index_1.regex.exec('@lcdev/app-config')).toBeTruthy();
        expect(index_1.regex.exec('.app-config.yml')).toBeTruthy();
        expect(index_1.regex.exec('.app-config.prod.yml')).toBeTruthy();
        expect(index_1.regex.exec('app-config.yml')).toBeTruthy();
        expect(index_1.regex.exec('foo')).toBe(null);
    });
});
//# sourceMappingURL=index.test.js.map