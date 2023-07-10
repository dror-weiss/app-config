"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlugin = void 0;
const path_1 = __importDefault(require("path"));
const config_1 = require("@app-config/config");
const utils_1 = require("@app-config/utils");
const schema_1 = require("@app-config/schema");
const createPlugin = ({ useGlobalNamespace = true, loadingOptions, schemaLoadingOptions, injectValidationFunction = true, noBundledConfig = false, } = {}) => ({
    name: '@app-config/esbuild',
    setup(build) {
        build.onResolve({ filter: utils_1.packageNameRegex }, (args) => ({
            path: args.path,
            namespace: '@app-config/esbuild',
        }));
        build.onResolve({ filter: utils_1.appConfigImportRegex }, (args) => ({
            path: args.path,
            namespace: '@app-config/esbuild',
        }));
        build.onLoad({ filter: /.*/, namespace: '@app-config/esbuild' }, async () => {
            if (noBundledConfig) {
                const { validationFunctionCode } = await (0, schema_1.loadSchema)(schemaLoadingOptions);
                const code = (0, utils_1.generateModuleText)(undefined, {
                    environment: undefined,
                    useGlobalNamespace: true,
                    validationFunctionCode: injectValidationFunction ? validationFunctionCode : undefined,
                    esmValidationCode: true,
                });
                return {
                    loader: 'js',
                    contents: code,
                    resolveDir: path_1.default.parse(process.cwd()).root,
                    watchFiles: [],
                };
            }
            const { fullConfig, environment, validationFunctionCode, filePaths } = await (0, config_1.loadValidatedConfig)(loadingOptions, schemaLoadingOptions);
            const code = (0, utils_1.generateModuleText)(fullConfig, {
                environment,
                useGlobalNamespace,
                validationFunctionCode: injectValidationFunction ? validationFunctionCode : undefined,
                esmValidationCode: true,
            });
            return {
                loader: 'js',
                contents: code,
                resolveDir: path_1.default.parse(process.cwd()).root,
                watchFiles: filePaths,
            };
        });
    },
});
exports.createPlugin = createPlugin;
exports.default = exports.createPlugin;
//# sourceMappingURL=index.js.map