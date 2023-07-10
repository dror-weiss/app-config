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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadExtraParsingExtension = exports.loadExtraParsingExtensions = exports.loadMetaConfigLazy = exports.loadMetaConfig = void 0;
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const core_1 = require("@app-config/core");
const logging_1 = require("@app-config/logging");
const node_1 = require("@app-config/node");
const default_extensions_1 = require("@app-config/default-extensions");
async function loadMetaConfig({ directory = '.', fileNameBase = '.app-config.meta', lookForWorkspace = '.git', } = {}) {
    let workspaceRoot = (0, path_1.resolve)(directory);
    // look upwards until a .git (workspace root) folder is found
    while (lookForWorkspace) {
        const parentDir = (0, path_1.resolve)((0, path_1.join)(workspaceRoot, '..'));
        // we didn't find a .git root
        if (parentDir === workspaceRoot) {
            workspaceRoot = undefined;
            break;
        }
        workspaceRoot = parentDir;
        if (await (0, fs_extra_1.pathExists)((0, path_1.join)(workspaceRoot, lookForWorkspace))) {
            break;
        }
    }
    // we try to find meta find in our CWD, but fallback to the workspace (git repo) root
    const sources = [new node_1.FlexibleFileSource((0, path_1.join)((0, path_1.resolve)(directory), fileNameBase))];
    if (workspaceRoot && workspaceRoot !== directory) {
        sources.push(new node_1.FlexibleFileSource((0, path_1.join)(workspaceRoot, fileNameBase)));
    }
    const source = new core_1.FallbackSource(sources);
    try {
        const parsed = await source.read((0, default_extensions_1.defaultMetaExtensions)());
        const value = parsed.toJSON();
        const fileSources = parsed.sources.filter((s) => s instanceof node_1.FileSource);
        const [{ filePath, fileType }] = fileSources.filter((s) => s.filePath.includes(fileNameBase));
        logging_1.logger.verbose(`Meta file was loaded from ${filePath}`);
        return {
            filePath,
            fileType,
            value,
        };
    }
    catch (error) {
        if (error instanceof core_1.FallbackExhaustedError) {
            for (const { filepath } of error.errors) {
                if (sources.some((s) => s.filePath === filepath)) {
                    logging_1.logger.verbose(`Meta file was not found in ${directory} or workspace root (${workspaceRoot !== null && workspaceRoot !== void 0 ? workspaceRoot : 'none'})`);
                    return { value: {} };
                }
            }
        }
        throw error;
    }
}
exports.loadMetaConfig = loadMetaConfig;
let metaConfig;
async function loadMetaConfigLazy(options) {
    if (!metaConfig) {
        metaConfig = loadMetaConfig(options);
    }
    return metaConfig;
}
exports.loadMetaConfigLazy = loadMetaConfigLazy;
async function loadExtraParsingExtensions({ value, }) {
    if (value.parsingExtensions) {
        return Promise.all(value.parsingExtensions.map(loadExtraParsingExtension));
    }
    return Promise.resolve([]);
}
exports.loadExtraParsingExtensions = loadExtraParsingExtensions;
async function loadExtraParsingExtension(extensionConfig) {
    let name;
    let options;
    if (typeof extensionConfig === 'string') {
        name = extensionConfig;
    }
    else {
        ({ name, options } = extensionConfig);
    }
    logging_1.logger.verbose(`Loading parsing extension: ${name}`);
    const loaded = (await (_a = name, Promise.resolve().then(() => __importStar(require(_a)))));
    if (typeof loaded === 'function') {
        return loaded(options);
    }
    if ('default' in loaded) {
        return loaded.default(options);
    }
    throw new core_1.AppConfigError(`Loaded parsing config module was invalid: ${name}`);
}
exports.loadExtraParsingExtension = loadExtraParsingExtension;
//# sourceMappingURL=index.js.map