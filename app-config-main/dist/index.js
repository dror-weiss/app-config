"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockConfig = exports.resetConfigInternal = exports.defaultMetaExtensions = exports.defaultEnvExtensions = exports.defaultExtensions = exports.encryptedDirective = exports.overrideDirective = exports.extendsSelfDirective = exports.extendsDirective = exports.envDirective = exports.environmentVariableSubstitution = exports.EnvironmentSource = exports.FlexibleFileSource = exports.FileSource = exports.defaultAliases = exports.currentEnvironment = exports.loadMetaConfig = exports.loadSchema = exports.loadUnvalidatedConfig = exports.loadValidatedConfig = exports.LogLevel = exports.setLogLevel = exports.parseRawString = exports.filePathAssumedType = exports.stringify = exports.FileType = exports.FallbackSource = exports.CombinedSource = exports.LiteralSource = exports.ConfigSource = exports.ParsedValue = exports.validateConfig = exports.config = exports.loadConfig = exports.AccessingAppConfig = void 0;
const util_1 = require("util");
const core_1 = require("@app-config/core");
const logging_1 = require("@app-config/logging");
const config_1 = require("@app-config/config");
/** Tried to read app-config value before it was loaded */
class AccessingAppConfig extends core_1.AppConfigError {
}
exports.AccessingAppConfig = AccessingAppConfig;
// the export of this module is a proxy in front of this value
let loadedConfig;
let isMocked = false;
const assertLoaded = () => {
    if (!loadedConfig) {
        throw new AccessingAppConfig('Tried to read app-config value before calling loadConfig!');
    }
    return loadedConfig;
};
/**
 * Reads and validates app-config, using the default loading strategy.
 * Same as `loadValidatedConfig` but stores loaded config in the `config` export.
 */
async function loadConfig(options, schemaOptions) {
    if (loadedConfig) {
        logging_1.logger.warn('Called loadConfig, even though config was already loaded elsewhere');
        if (isMocked) {
            throw new core_1.AppConfigError(`Called loadConfig after config was mocked with mockConfig!`);
        }
    }
    const { fullConfig } = await (0, config_1.loadValidatedConfig)(options, schemaOptions);
    loadedConfig = fullConfig;
    return exports.config;
}
exports.loadConfig = loadConfig;
/**
 * Singleton for loaded configuration, when `loadConfig` has completed successfully.
 *
 * Reading properties on this object before `loadConfig` completes will throw errors.
 */
exports.config = new Proxy({
    APP_CONFIG_WAS_NOT_LOADED_YET_LOOK_AT_THE_DOCS: true,
    [util_1.inspect.custom]() {
        return (0, util_1.inspect)(assertLoaded());
    },
    toJSON() {
        return assertLoaded();
    },
}, {
    ownKeys() {
        return Reflect.ownKeys(assertLoaded());
    },
    has(_, key) {
        return key in assertLoaded();
    },
    get(_, prop) {
        return Reflect.get(assertLoaded(), prop);
    },
    getOwnPropertyDescriptor(_, key) {
        return Object.getOwnPropertyDescriptor(assertLoaded(), key);
    },
    set() {
        throw new core_1.AppConfigError('Setting properties on app-config is not allowed');
    },
    defineProperty() {
        throw new core_1.AppConfigError('Setting properties on app-config is not allowed');
    },
    deleteProperty() {
        throw new core_1.AppConfigError('Deleting properties from app-config is not allowed');
    },
});
exports.default = exports.config;
/**
 * ONLY available when using @app-config/webpack. Validates configuration using AJV.
 */
exports.validateConfig = null; // eslint-disable-line
var core_2 = require("@app-config/core");
Object.defineProperty(exports, "ParsedValue", { enumerable: true, get: function () { return core_2.ParsedValue; } });
Object.defineProperty(exports, "ConfigSource", { enumerable: true, get: function () { return core_2.ConfigSource; } });
Object.defineProperty(exports, "LiteralSource", { enumerable: true, get: function () { return core_2.LiteralSource; } });
Object.defineProperty(exports, "CombinedSource", { enumerable: true, get: function () { return core_2.CombinedSource; } });
Object.defineProperty(exports, "FallbackSource", { enumerable: true, get: function () { return core_2.FallbackSource; } });
Object.defineProperty(exports, "FileType", { enumerable: true, get: function () { return core_2.FileType; } });
Object.defineProperty(exports, "stringify", { enumerable: true, get: function () { return core_2.stringify; } });
Object.defineProperty(exports, "filePathAssumedType", { enumerable: true, get: function () { return core_2.filePathAssumedType; } });
Object.defineProperty(exports, "parseRawString", { enumerable: true, get: function () { return core_2.parseRawString; } });
var logging_2 = require("@app-config/logging");
Object.defineProperty(exports, "setLogLevel", { enumerable: true, get: function () { return logging_2.setLogLevel; } });
Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return logging_2.LogLevel; } });
var config_2 = require("@app-config/config");
Object.defineProperty(exports, "loadValidatedConfig", { enumerable: true, get: function () { return config_2.loadValidatedConfig; } });
Object.defineProperty(exports, "loadUnvalidatedConfig", { enumerable: true, get: function () { return config_2.loadUnvalidatedConfig; } });
var schema_1 = require("@app-config/schema");
Object.defineProperty(exports, "loadSchema", { enumerable: true, get: function () { return schema_1.loadSchema; } });
var meta_1 = require("@app-config/meta");
Object.defineProperty(exports, "loadMetaConfig", { enumerable: true, get: function () { return meta_1.loadMetaConfig; } });
var node_1 = require("@app-config/node");
Object.defineProperty(exports, "currentEnvironment", { enumerable: true, get: function () { return node_1.currentEnvironment; } });
Object.defineProperty(exports, "defaultAliases", { enumerable: true, get: function () { return node_1.defaultAliases; } });
Object.defineProperty(exports, "FileSource", { enumerable: true, get: function () { return node_1.FileSource; } });
Object.defineProperty(exports, "FlexibleFileSource", { enumerable: true, get: function () { return node_1.FlexibleFileSource; } });
Object.defineProperty(exports, "EnvironmentSource", { enumerable: true, get: function () { return node_1.EnvironmentSource; } });
var extensions_1 = require("@app-config/extensions");
Object.defineProperty(exports, "environmentVariableSubstitution", { enumerable: true, get: function () { return extensions_1.environmentVariableSubstitution; } });
Object.defineProperty(exports, "envDirective", { enumerable: true, get: function () { return extensions_1.envDirective; } });
Object.defineProperty(exports, "extendsDirective", { enumerable: true, get: function () { return extensions_1.extendsDirective; } });
Object.defineProperty(exports, "extendsSelfDirective", { enumerable: true, get: function () { return extensions_1.extendsSelfDirective; } });
Object.defineProperty(exports, "overrideDirective", { enumerable: true, get: function () { return extensions_1.overrideDirective; } });
var encryption_1 = require("@app-config/encryption");
Object.defineProperty(exports, "encryptedDirective", { enumerable: true, get: function () { return __importDefault(encryption_1).default; } });
var default_extensions_1 = require("@app-config/default-extensions");
Object.defineProperty(exports, "defaultExtensions", { enumerable: true, get: function () { return default_extensions_1.defaultExtensions; } });
Object.defineProperty(exports, "defaultEnvExtensions", { enumerable: true, get: function () { return default_extensions_1.defaultEnvExtensions; } });
Object.defineProperty(exports, "defaultMetaExtensions", { enumerable: true, get: function () { return default_extensions_1.defaultMetaExtensions; } });
/** @hidden Please don't rely on this. */
function resetConfigInternal() {
    loadedConfig = undefined;
}
exports.resetConfigInternal = resetConfigInternal;
/**
 * Overrides the configuration internally, setting it to the provided override.
 */
function mockConfig(override) {
    loadedConfig = override;
    isMocked = true;
    return () => {
        loadedConfig = undefined;
        isMocked = false;
    };
}
exports.mockConfig = mockConfig;
//# sourceMappingURL=index.js.map