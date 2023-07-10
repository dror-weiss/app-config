"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.guessFileType = exports.parseRawString = exports.filePathAssumedType = exports.stringify = exports.FallbackSource = exports.CombinedSource = exports.LiteralSource = exports.ConfigSource = exports.FileType = void 0;
const path_1 = require("path");
const toml_1 = require("@iarna/toml");
const js_yaml_1 = require("js-yaml");
const json5_1 = __importDefault(require("json5"));
const logging_1 = require("@app-config/logging");
const parsed_value_1 = require("./parsed-value");
const errors_1 = require("./errors");
/**
 * File formats that app-config supports.
 */
var FileType;
(function (FileType) {
    FileType["YAML"] = "YAML";
    FileType["TOML"] = "TOML";
    FileType["JSON"] = "JSON";
    FileType["JSON5"] = "JSON5";
    /** @hidden Raw is only used for CLI output */
    FileType["RAW"] = "RAW";
})(FileType = exports.FileType || (exports.FileType = {}));
/** Base class for "sources", which are strategies to read configuration (eg. files, environment variables) */
class ConfigSource {
    /** Parses contents of the source */
    async readValue() {
        const [contents, fileType] = await this.readContents();
        return parseRawString(contents, fileType);
    }
    /** Reads the contents of the source into a full ParsedValue (not the raw JSON, like readValue) */
    async read(extensions, context) {
        const rawValue = await this.readValue();
        return parsed_value_1.ParsedValue.parse(rawValue, this, extensions, undefined, context);
    }
    /** Ergonomic helper for chaining `source.read(extensions).then(v => v.toJSON())` */
    async readToJSON(extensions, context) {
        const parsed = await this.read(extensions, context);
        return parsed.toJSON();
    }
}
exports.ConfigSource = ConfigSource;
/** Read configuration from a literal JS object */
class LiteralSource extends ConfigSource {
    constructor(value) {
        super();
        this.value = value;
    }
    async readContents() {
        return [JSON.stringify(this.value), FileType.JSON];
    }
    async readValue() {
        return this.value; // overriden just for performance
    }
}
exports.LiteralSource = LiteralSource;
/** Read configuration from many ConfigSources and merge them */
class CombinedSource extends ConfigSource {
    constructor(sources) {
        super();
        this.sources = sources;
        if (sources.length === 0) {
            throw new errors_1.AppConfigError('CombinedSource requires at least one source');
        }
    }
    // overriden only because it's part of the class signature, normally would never be called
    async readContents() {
        const value = await this.readValue();
        return [JSON.stringify(value), FileType.JSON];
    }
    // override because readContents uses it (which is backwards from super class)
    async readValue() {
        return this.readToJSON();
    }
    // override so that ParsedValue is directly from the originating ConfigSource
    async read(extensions, context) {
        const values = await Promise.all(this.sources.map((source) => source.read(extensions, Object.assign({}, context))));
        const merged = values.reduce((acc, parsed) => {
            if (!acc)
                return parsed;
            return parsed_value_1.ParsedValue.merge(acc, parsed);
        }, undefined);
        if (!merged)
            throw new errors_1.AppConfigError('CombinedSource ended up merging into a falsey value');
        Object.assign(merged, { sources: [this] });
        return merged;
    }
}
exports.CombinedSource = CombinedSource;
/** Read configuration from the first ConfigSource that doesn't fail */
class FallbackSource extends ConfigSource {
    constructor(sources) {
        super();
        this.sources = sources;
        if (sources.length === 0) {
            throw new errors_1.AppConfigError('FallbackSource requires at least one source');
        }
    }
    // overriden only because it's part of the class signature, normally would never be called
    async readContents() {
        const value = await this.readValue();
        return [JSON.stringify(value), FileType.JSON];
    }
    // override because readContents uses it (which is backwards from super class)
    async readValue() {
        const errors = [];
        // take the first value that comes back without an error
        for (const source of this.sources) {
            try {
                const value = await source.readValue();
                logging_1.logger.verbose(`FallbackSource found successful source`);
                return value;
            }
            catch (error) {
                if (source.filePath) {
                    // special case for ConfigSource with `filePath`, only accept a NotFoundError for it's filePath
                    if (errors_1.NotFoundError.isNotFoundError(error, source.filePath)) {
                        errors.push(error);
                        continue;
                    }
                }
                else if (errors_1.NotFoundError.isNotFoundError(error)) {
                    errors.push(error);
                    continue;
                }
                throw error;
            }
        }
        throw new errors_1.FallbackExhaustedError('FallbackSource found no valid ConfigSource', errors);
    }
    // override so that ParsedValue is directly from the originating ConfigSource
    async read(extensions, context) {
        const errors = [];
        // take the first value that comes back without an error
        for (const source of this.sources) {
            try {
                const value = await source.read(extensions, context);
                logging_1.logger.verbose(`FallbackSource found successful source`);
                return value;
            }
            catch (error) {
                if (source.filePath) {
                    // special case for ConfigSource with `filePath`, only accept a NotFoundError for it's filePath
                    if (errors_1.NotFoundError.isNotFoundError(error, source.filePath)) {
                        errors.push(error);
                        continue;
                    }
                }
                else if (errors_1.NotFoundError.isNotFoundError(error)) {
                    errors.push(error);
                    continue;
                }
                throw error;
            }
        }
        throw new errors_1.FallbackExhaustedError('FallbackSource found no valid ConfigSource', errors);
    }
}
exports.FallbackSource = FallbackSource;
/**
 * Converts a JSON object to a string, using specified file type.
 */
function stringify(config, fileType, minimal = false) {
    switch (fileType) {
        case FileType.JSON:
            return JSON.stringify(config, null, minimal ? 0 : 2);
        case FileType.JSON5:
            return json5_1.default.stringify(config, null, minimal ? 0 : 2);
        case FileType.TOML:
            return (0, toml_1.stringify)(config);
        case FileType.YAML:
            return (0, js_yaml_1.safeDump)(config);
        case FileType.RAW: {
            if (typeof config === 'string')
                return config;
            if (typeof config === 'number')
                return `${config}`;
            if (typeof config === 'boolean')
                return config ? 'true' : 'false';
            throw new errors_1.BadFileType(`Stringifying "raw" only works with primitive values`);
        }
        default:
            throw new errors_1.BadFileType(`Unsupported FileType '${fileType}'`);
    }
}
exports.stringify = stringify;
/**
 * Returns which file type to use, based on the file extension.
 */
function filePathAssumedType(filePath) {
    switch ((0, path_1.extname)(filePath).toLowerCase().slice(1)) {
        case 'yml':
        case 'yaml':
            return FileType.YAML;
        case 'toml':
            return FileType.TOML;
        case 'json':
            return FileType.JSON;
        case 'json5':
            return FileType.JSON5;
        default:
            throw new errors_1.BadFileType(`The file path "${filePath}" has an ambiguous file type, and a FileType could not be inferred`);
    }
}
exports.filePathAssumedType = filePathAssumedType;
/**
 * Parses string based on a file format.
 */
async function parseRawString(contents, fileType) {
    var _a;
    switch (fileType) {
        case FileType.JSON:
            return JSON.parse(contents);
        case FileType.YAML:
            return ((_a = (0, js_yaml_1.safeLoad)(contents)) !== null && _a !== void 0 ? _a : {});
        case FileType.TOML:
            return (0, toml_1.parse)(contents);
        case FileType.JSON5:
            return json5_1.default.parse(contents);
        default:
            throw new errors_1.BadFileType(`Unsupported FileType '${fileType}'`);
    }
}
exports.parseRawString = parseRawString;
/**
 * Try to parse string as different file formats, returning the first that worked.
 */
async function guessFileType(contents) {
    for (const tryType of [FileType.JSON, FileType.TOML, FileType.JSON5, FileType.YAML]) {
        try {
            await parseRawString(contents, tryType);
            return tryType;
        }
        catch (_a) {
            // parsing errors are expected
        }
    }
    throw new errors_1.ParsingError(`The provided configuration was not in a detectable/parseable format`);
}
exports.guessFileType = guessFileType;
//# sourceMappingURL=config-source.js.map