"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseValue = exports.ParsedValue = exports.Root = exports.InArray = exports.InObject = void 0;
const util_1 = require("util");
const lodash_merge_1 = __importDefault(require("lodash.merge"));
const utils_1 = require("@app-config/utils");
const logging_1 = require("@app-config/logging");
const config_source_1 = require("./config-source");
const errors_1 = require("./errors");
/** The property being visited was a property in an object */
exports.InObject = Symbol('InObject');
/** The property being visited was a value in an array */
exports.InArray = Symbol('InArray');
/** The property being visited is the root object */
exports.Root = Symbol('Root');
/** Wrapper abstraction of values parsed, allowing for transformations of data (while keeping original raw form) */
class ParsedValue {
    constructor(source, raw, value) {
        this.meta = {};
        this.sources = Array.isArray(source) ? source : [source];
        this.raw = raw;
        this.value = value;
    }
    /** Constructs a ParsedValue from a plain JSON object */
    static literal(raw, source = new config_source_1.LiteralSource(raw)) {
        return literalParsedValue(raw, source);
    }
    /** Parses (with extensions) from a value that was read from ConfigSource */
    static async parse(raw, source, extensions, metadata, context) {
        return parseValue(raw, source, extensions, metadata, context);
    }
    /** Parses (with extensions) from a plain JSON object */
    static async parseLiteral(raw, extensions = []) {
        return parseValue(raw, new config_source_1.LiteralSource(raw), extensions);
    }
    /** Deep merge two ParsedValue objects */
    static merge(a, b) {
        var _a, _b;
        const meta = (0, lodash_merge_1.default)(a.meta, b.meta);
        if (
        // an array or primitive value overrides us
        Array.isArray(b.value) ||
            typeof b.value !== 'object' ||
            b.value === null ||
            // if we were an array or primitive, they override us
            Array.isArray(a.value) ||
            typeof a.value !== 'object' ||
            a.value === null) {
            return new ParsedValue(b.sources, b.raw, b.value).assignMeta(meta);
        }
        const newValue = {};
        const keys = new Set(Object.keys(b.value).concat(Object.keys(a.value)));
        for (const key of keys) {
            let newValueK;
            if (a.value[key] && b.value[key]) {
                newValueK = ParsedValue.merge(a.value[key], b.value[key]);
            }
            else {
                newValueK = (_a = b.value[key]) !== null && _a !== void 0 ? _a : a.value[key];
            }
            Object.assign(newValue, { [key]: newValueK });
        }
        let newRawValue = {};
        if ((0, utils_1.isObject)(a.raw) && (0, utils_1.isObject)(b.raw)) {
            const rawKeys = new Set(Object.keys(b.raw).concat(Object.keys(a.raw)));
            for (const key of rawKeys) {
                let newRawValueK;
                if (a.raw[key] && b.raw[key]) {
                    newRawValueK = (0, lodash_merge_1.default)({}, a.raw[key], b.raw[key]);
                }
                else {
                    newRawValueK = (_b = b.raw[key]) !== null && _b !== void 0 ? _b : a.raw[key];
                }
                Object.assign(newRawValue, { [key]: newRawValueK });
            }
        }
        else {
            newRawValue = b.raw;
        }
        return new ParsedValue([...a.sources, ...b.sources], newRawValue, newValue).assignMeta(meta);
    }
    /** Returns the first ConfigSource that is of some instance type */
    getSource(clazz) {
        for (const source of this.sources) {
            if (source instanceof clazz) {
                return source;
            }
        }
    }
    /** Returns the first ConfigSource that is of some instance type */
    assertSource(clazz) {
        const source = this.getSource(clazz);
        if (source) {
            return source;
        }
        throw new errors_1.AppConfigError(`Failed to find ConfigSource ${clazz.name}`);
    }
    /** Returns all ConfigSource objects that contributed to this value (including nested) */
    allSources() {
        const sources = new Set(this.sources);
        if (Array.isArray(this.value)) {
            for (const inner of this.value) {
                for (const source of inner.sources) {
                    sources.add(source);
                }
            }
        }
        if (typeof this.value === 'object' && this.value !== null) {
            for (const inner of Object.values(this.value)) {
                for (const source of inner.sources) {
                    sources.add(source);
                }
            }
        }
        return sources;
    }
    /** Adds metadata to the ParsedValue */
    assignMeta(metadata) {
        Object.assign(this.meta, metadata);
        return this;
    }
    /** Removes metadata by key */
    removeMeta(key) {
        delete this.meta[key];
        return this;
    }
    /** Lookup property by nested key name(s) */
    property([key, ...rest]) {
        var _a, _b;
        if (key === '')
            return this.property(rest);
        if (key === undefined || !this.value || typeof this.value !== 'object') {
            return this;
        }
        if (Array.isArray(this.value)) {
            return (_a = this.value[parseFloat(key)]) === null || _a === void 0 ? void 0 : _a.property(rest);
        }
        return (_b = this.value[key]) === null || _b === void 0 ? void 0 : _b.property(rest);
    }
    /** Returns JSON object if the value is one */
    asObject() {
        if (typeof this.value === 'object' && this.value !== null && !Array.isArray(this.value)) {
            return this.value;
        }
    }
    /** Returns JSON array if the value is one */
    asArray() {
        if (Array.isArray(this.value))
            return this.value;
    }
    /** Returns JSON primitive value if the value is one */
    asPrimitive() {
        if ((typeof this.value !== 'object' || this.value === null) && !Array.isArray(this.value)) {
            return this.value;
        }
    }
    /** Returns if the underlying value is an object */
    isObject() {
        return this.asObject() !== undefined;
    }
    /** Returns if the underlying value is an array */
    isArray() {
        return this.asArray() !== undefined;
    }
    /** Returns if the underlying value is a primitive */
    isPrimitive() {
        return this.asPrimitive() !== undefined;
    }
    /** Deep clones underlying value */
    clone() {
        return this.cloneWhere(() => true);
    }
    /** Deep clones underlying value, depending on a predicate function */
    cloneWhere(filter) {
        if (Array.isArray(this.value)) {
            const filtered = this.value.filter(filter);
            return new ParsedValue(this.sources, filtered.map((v) => v.raw), filtered.map((v) => v.cloneWhere(filter)));
        }
        if (typeof this.value === 'object' && this.value !== null) {
            const value = {};
            const raw = {};
            for (const [key, entry] of Object.entries(this.value)) {
                if (filter(entry)) {
                    value[key] = entry.cloneWhere(filter);
                    if ((0, utils_1.isObject)(this.raw)) {
                        raw[key] = this.raw[key];
                    }
                }
            }
            return new ParsedValue(this.sources, raw, value);
        }
        if (!filter(this)) {
            throw new errors_1.AppConfigError('ParsedValue::cloneWhere filtered itself out');
        }
        return new ParsedValue(this.sources, this.raw, this.value);
    }
    /** Calls the function, with every nested ParsedValue */
    visitAll(callback) {
        callback(this);
        if (Array.isArray(this.value)) {
            this.value.forEach((item) => {
                item.visitAll(callback);
            });
        }
        else if (typeof this.value === 'object' && this.value !== null) {
            for (const item of Object.values(this.value)) {
                item.visitAll(callback);
            }
        }
    }
    /** Extracts underlying JSON value from the wrapper */
    toJSON() {
        if (Array.isArray(this.value)) {
            return this.value.map((v) => v.toJSON());
        }
        // transforming to JSON requires recursive descent into each level to toJSON
        // this is because each layer has ParsedValues, not POJOs
        if (this.value && typeof this.value === 'object') {
            const json = {};
            for (const [key, value] of Object.entries(this.value)) {
                json[key] = value.toJSON();
            }
            return json;
        }
        return this.value;
    }
    [util_1.inspect.custom]() {
        if (this.meta.parsedFromEncryptedValue) {
            return `ParsedValue(encrypted) <${(0, util_1.inspect)(this.value)}>`;
        }
        if (this.meta.fromSecrets) {
            return `ParsedValue(secret) <${(0, util_1.inspect)(this.value)}>`;
        }
        if (Object.keys(this.meta).length > 0) {
            return `ParsedValue(${(0, util_1.inspect)(this.meta)}) <${(0, util_1.inspect)(this.value)}>`;
        }
        return `ParsedValue <${(0, util_1.inspect)(this.value)}>`;
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
}
exports.ParsedValue = ParsedValue;
function literalParsedValue(raw, source) {
    let transformed;
    if (Array.isArray(raw)) {
        transformed = raw.map((v) => literalParsedValue(v, source));
    }
    else if ((0, utils_1.isObject)(raw)) {
        transformed = {};
        for (const [key, value] of Object.entries(raw)) {
            transformed[key] = literalParsedValue(value, source);
        }
    }
    else {
        transformed = raw;
    }
    return new ParsedValue(source, raw, transformed);
}
/** Same as ParsedValue.parse */
async function parseValue(value, source, extensions = [], metadata = {}, context = {}) {
    return parseValueInner(value, source, extensions, metadata, context, [[exports.Root]], value);
}
exports.parseValue = parseValue;
async function parseValueInner(value, source, extensions, metadata = {}, context = {}, parentKeys, root, parent, visitedExtensions = new Set()) {
    const [currentKey] = parentKeys.slice(-1);
    const parentKeysNext = parentKeys.slice(0, parentKeys.length - 1);
    let applicableExtension;
    // before anything else, we check for parsing extensions that should be applied
    // we do this first, so that the traversal is top-down, not depth first
    // this is a bit counter-intuitive, but an example makes this clear:
    //   { $env: { default: { $extends: '...' }, production: { $extends: '...' } } }
    // in this example, we don't actually want to visit "production" if we don't have to
    //
    // for this reason, we pass "parse" as a function to extensions, so they can recurse as needed
    for (const extension of extensions) {
        // we track visitedExtensions so that calling `parse` in an extension doesn't hit that same extension with the same value
        if (visitedExtensions.has(extension))
            continue;
        if (extension.extensionName && visitedExtensions.has(extension.extensionName))
            continue;
        const applicable = extension(value, currentKey, parentKeysNext, context);
        if (applicable) {
            applicableExtension = applicable;
            visitedExtensions.add(extension);
            if (extension.extensionName) {
                visitedExtensions.add(extension.extensionName);
            }
            break;
        }
    }
    if (applicableExtension) {
        const parse = (inner, metadataOverride, sourceOverride, extensionsOverride, contextOverride) => parseValueInner(inner, sourceOverride !== null && sourceOverride !== void 0 ? sourceOverride : source, extensionsOverride !== null && extensionsOverride !== void 0 ? extensionsOverride : extensions, Object.assign(Object.assign({}, metadata), metadataOverride), Object.assign(Object.assign({}, context), contextOverride), parentKeys, root, parent, visitedExtensions);
        // note that we don't traverse the object is an extension applied, that's up to them (with `parse`)
        return applicableExtension(parse, parent, source, extensions, root);
    }
    if (Array.isArray(value)) {
        const output = await Promise.all(Array.from(value.entries()).map(([index, item]) => {
            return parseValueInner(item, source, extensions, undefined, context, parentKeys.concat([[exports.InArray, index]]), root, value);
        }));
        return new ParsedValue(source, value, output).assignMeta(metadata);
    }
    if ((0, utils_1.isObject)(value)) {
        const obj = {};
        // we have to queue up merging, so that non-merging keys get assigned first
        const toMerge = [];
        const toOverride = [];
        const flattenTo = [];
        await Promise.all(Object.entries(value).map(async ([key, item]) => {
            const parsed = await parseValueInner(item, source, extensions, undefined, context, parentKeys.concat([[exports.InObject, key]]), root, value);
            // NOTE: shouldMerge is treated as shouldFlatten when the value itself is not an object (because we cannot merge arrays or primitives)
            if (parsed.meta.shouldFlatten) {
                flattenTo.push(parsed.removeMeta('shouldFlatten'));
            }
            else if (parsed.meta.shouldMerge) {
                if (parsed.isObject()) {
                    toMerge.push(parsed.removeMeta('shouldMerge'));
                }
                else {
                    flattenTo.push(parsed.removeMeta('shouldMerge'));
                }
            }
            else if (parsed.meta.shouldOverride) {
                if (parsed.isObject()) {
                    toOverride.push(parsed.removeMeta('shouldOverride'));
                }
                else {
                    flattenTo.push(parsed.removeMeta('shouldOverride'));
                }
            }
            else if (parsed.meta.rewriteKey) {
                if (typeof parsed.meta.rewriteKey !== 'string') {
                    throw new errors_1.AppConfigError('Internal error: rewriteKey was not a string');
                }
                obj[parsed.meta.rewriteKey] = parsed.removeMeta('rewriteKey');
            }
            else {
                obj[key] = parsed;
            }
        }));
        if (flattenTo.length > 0) {
            if (Object.keys(value).length > 1) {
                logging_1.logger.warn(`An object with multiple keys is being flattened. Other values will be ignored.`);
            }
            if (flattenTo.length > 1) {
                logging_1.logger.warn(`Two values were present in an object that both tried to "flatten" - this is undefined behavior`);
            }
            return flattenTo[0].assignMeta(metadata);
        }
        let output = new ParsedValue(source, value, obj).assignMeta(metadata);
        // do merge(s) at the end, so it applies regardless of key order
        for (const parsed of toMerge) {
            output = ParsedValue.merge(parsed, output);
        }
        // toMerge vs toOverride just changes the order of precedent when merging
        for (const parsed of toOverride) {
            output = ParsedValue.merge(output, parsed);
        }
        return output;
    }
    return new ParsedValue(source, value, value).assignMeta(metadata);
}
//# sourceMappingURL=parsed-value.js.map