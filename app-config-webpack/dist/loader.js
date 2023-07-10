"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regex = void 0;
const loader_utils_1 = require("loader-utils");
const config_1 = require("@app-config/config");
const utils_1 = require("@app-config/utils");
const schema_1 = require("@app-config/schema");
const loader = function AppConfigLoader() {
    var _a, _b, _c, _d, _e, _f;
    if (this.cacheable)
        this.cacheable();
    const callback = this.async();
    const options = Object.assign(Object.assign({}, (0, loader_utils_1.getOptions)(this)), (0, loader_utils_1.parseQuery)(this.resourceQuery));
    const useGlobalNamespace = (_a = options.useGlobalNamespace) !== null && _a !== void 0 ? _a : !options.noGlobal;
    const loadingOptions = (_c = (_b = options.loadingOptions) !== null && _b !== void 0 ? _b : options.loading) !== null && _c !== void 0 ? _c : {};
    const schemaLoadingOptions = (_d = options.schemaLoadingOptions) !== null && _d !== void 0 ? _d : options.schemaLoading;
    const injectValidationFunction = (_e = options.injectValidationFunction) !== null && _e !== void 0 ? _e : true;
    const noBundledConfig = (_f = options.noBundledConfig) !== null && _f !== void 0 ? _f : false;
    if (noBundledConfig) {
        (0, schema_1.loadSchema)(schemaLoadingOptions)
            .then(({ validationFunctionCode }) => {
            callback(null, (0, utils_1.generateModuleText)(undefined, {
                environment: undefined,
                useGlobalNamespace: true,
                validationFunctionCode: injectValidationFunction ? validationFunctionCode : undefined,
                esmValidationCode: false,
            }));
        })
            .catch((err) => {
            this.emitWarning(new Error(`There was an error when trying to load @app-config`));
            callback(err);
        });
        return;
    }
    (0, config_1.loadValidatedConfig)(loadingOptions, schemaLoadingOptions)
        .then(({ fullConfig, environment, filePaths, validationFunctionCode }) => {
        if (filePaths) {
            filePaths.forEach((filePath) => this.addDependency(filePath));
        }
        callback(null, (0, utils_1.generateModuleText)(fullConfig, {
            environment,
            useGlobalNamespace,
            validationFunctionCode: injectValidationFunction ? validationFunctionCode : undefined,
            esmValidationCode: false,
        }));
    })
        .catch((err) => {
        this.emitWarning(new Error(`There was an error when trying to load @app-config`));
        callback(err);
    });
};
exports.default = loader;
exports.regex = utils_1.packageNameRegex;
//# sourceMappingURL=loader.js.map