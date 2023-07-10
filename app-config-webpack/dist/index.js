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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loader = exports.regex = void 0;
const path_1 = require("path");
const logging_1 = require("@app-config/logging");
const loader_1 = require("./loader");
Object.defineProperty(exports, "regex", { enumerable: true, get: function () { return loader_1.regex; } });
// loader is the filepath, not the export
const loader = require.resolve('./loader');
exports.loader = loader;
class AppConfigPlugin {
    constructor(options = {}) {
        var _a, _b, _c, _d, _e, _f, _g;
        this.headerInjection = (_a = options.headerInjection) !== null && _a !== void 0 ? _a : false;
        this.useGlobalNamespace = (_b = options.useGlobalNamespace) !== null && _b !== void 0 ? _b : !options.noGlobal;
        this.loadingOptions = (_c = options.loadingOptions) !== null && _c !== void 0 ? _c : options.loading;
        this.schemaLoadingOptions = (_d = options.schemaLoadingOptions) !== null && _d !== void 0 ? _d : options.schemaLoading;
        this.injectValidationFunction = (_e = options.injectValidationFunction) !== null && _e !== void 0 ? _e : true;
        this.noBundledConfig = (_f = options.noBundledConfig) !== null && _f !== void 0 ? _f : false;
        this.intercept = (_g = options.intercept) !== null && _g !== void 0 ? _g : AppConfigPlugin.regex;
    }
    apply(compiler) {
        if (this.headerInjection && !process.env.WEBPACK_DEV_SERVER) {
            this.injectHead(compiler);
        }
        this.interceptImports(compiler);
    }
    interceptImports(compiler) {
        compiler.hooks.normalModuleFactory.tap('AppConfigPlugin', (factory) => {
            factory.hooks.beforeResolve.tapPromise('AppConfigPlugin', async (resolve) => {
                if (!resolve)
                    return;
                if (this.intercept.test(resolve.request)) {
                    const queryString = JSON.stringify({
                        headerInjection: this.headerInjection,
                        useGlobalNamespace: this.useGlobalNamespace,
                        loadingOptions: this.loadingOptions,
                        schemaLoadingOptions: this.schemaLoadingOptions,
                        injectValidationFunction: this.injectValidationFunction,
                        noBundledConfig: this.noBundledConfig,
                        // deprecated options
                        noGlobal: !this.useGlobalNamespace,
                        loading: this.loadingOptions,
                        schemaLoading: this.schemaLoadingOptions,
                    });
                    // eslint-disable-next-line no-param-reassign
                    resolve.request = `${(0, path_1.join)(__dirname, '..', '.config-placeholder')}?${queryString}`;
                }
            });
        });
    }
    injectHead(compiler) {
        compiler.hooks.compilation.tap('AppConfigPlugin', (compilation) => {
            Promise.resolve().then(() => __importStar(require('html-webpack-plugin'))).then((module) => {
                const HtmlWebpackPlugin = module.default;
                HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapPromise('AppConfigPlugin', async (_a) => {
                    var { headTags } = _a, html = __rest(_a, ["headTags"]);
                    // remove placeholder <script id="app-config"></script> if it exists
                    const newTags = headTags.filter(({ attributes }) => attributes.id !== 'app-config');
                    newTags.push({
                        tagName: 'script',
                        attributes: { id: 'app-config', type: 'text/javascript' },
                        innerHTML: ``,
                        voidTag: false,
                        meta: {},
                    });
                    return Object.assign(Object.assign({}, html), { headTags: newTags });
                });
            })
                .catch((error) => {
                logging_1.logger.error(error.message);
                logging_1.logger.error('Failed to resolve html-webpack-plugin');
                logging_1.logger.error('Either include the module in your dependencies and enable the webpack plugin, or set headerInjection to false in your configuration.');
            });
        });
    }
}
exports.default = AppConfigPlugin;
AppConfigPlugin.loader = loader;
AppConfigPlugin.regex = loader_1.regex;
//# sourceMappingURL=index.js.map