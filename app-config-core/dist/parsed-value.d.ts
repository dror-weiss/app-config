/// <reference types="node" />
import { inspect } from 'util';
import { Json, JsonObject, JsonPrimitive } from '@app-config/utils';
import { ConfigSource } from './config-source';
/** The property being visited was a property in an object */
export declare const InObject: unique symbol;
/** The property being visited was a value in an array */
export declare const InArray: unique symbol;
/** The property being visited is the root object */
export declare const Root: unique symbol;
/** Descriptor for what "key" that a value was defined under within JSON */
export type ParsingExtensionKey = [typeof InObject, string] | [typeof InArray, number] | [typeof Root];
/**
 * Arbitrary context that's passed through the hierachy during parsing, only downwards.
 *
 * This is used for environment overrides and other options, so that parsing below some
 * level in an object tree can override what the current environment is.
 */
export interface ParsingContext {
    [k: string]: string | string[] | undefined | ParsingContext;
}
/**
 * Performs transformations on raw values that were read.
 *
 * See https://app-config.dev/guide/intro/extensions.html
 */
export interface ParsingExtension {
    (value: Json, key: ParsingExtensionKey, parentKeys: ParsingExtensionKey[], context: ParsingContext): ParsingExtensionTransform | false;
    /**
     * A globally unique string that identifies what parsing extension this is.
     *
     * Used to avoid running the same extension twice when included twice.
     */
    extensionName?: string;
}
/**
 * Callback that will process and potentially transform a value.
 */
export type ParsingExtensionTransform = (parse: (value: Json, metadata?: ParsedValueMetadata, source?: ConfigSource, extensions?: ParsingExtension[], context?: ParsingContext) => Promise<ParsedValue>, parent: JsonObject | Json[] | undefined, source: ConfigSource, extensions: ParsingExtension[], root: Json) => Promise<ParsedValue> | ParsedValue;
/** Values associated with a ParsedValue */
export interface ParsedValueMetadata {
    [key: string]: any;
}
type ParsedValueInner = JsonPrimitive | {
    [k: string]: ParsedValue;
} | ParsedValue[];
/** Wrapper abstraction of values parsed, allowing for transformations of data (while keeping original raw form) */
export declare class ParsedValue {
    readonly meta: ParsedValueMetadata;
    readonly sources: ConfigSource[];
    readonly raw: Json;
    private readonly value;
    constructor(source: ConfigSource | ConfigSource[], raw: Json, value: ParsedValueInner);
    /** Constructs a ParsedValue from a plain JSON object */
    static literal(raw: Json, source?: ConfigSource): ParsedValue;
    /** Parses (with extensions) from a value that was read from ConfigSource */
    static parse(raw: Json, source: ConfigSource, extensions?: ParsingExtension[], metadata?: ParsedValueMetadata, context?: ParsingContext): Promise<ParsedValue>;
    /** Parses (with extensions) from a plain JSON object */
    static parseLiteral(raw: Json, extensions?: ParsingExtension[]): Promise<ParsedValue>;
    /** Deep merge two ParsedValue objects */
    static merge(a: ParsedValue, b: ParsedValue): ParsedValue;
    /** Returns the first ConfigSource that is of some instance type */
    getSource<CS extends ConfigSource>(clazz: new (...args: any[]) => CS): CS | undefined;
    /** Returns the first ConfigSource that is of some instance type */
    assertSource<CS extends ConfigSource>(clazz: new (...args: any[]) => CS): CS;
    /** Returns all ConfigSource objects that contributed to this value (including nested) */
    allSources(): Set<ConfigSource>;
    /** Adds metadata to the ParsedValue */
    assignMeta(metadata: ParsedValueMetadata): this;
    /** Removes metadata by key */
    removeMeta(key: string): this;
    /** Lookup property by nested key name(s) */
    property([key, ...rest]: string[]): ParsedValue | undefined;
    /** Returns JSON object if the value is one */
    asObject(): {
        [key: string]: ParsedValue;
    } | undefined;
    /** Returns JSON array if the value is one */
    asArray(): ParsedValue[] | undefined;
    /** Returns JSON primitive value if the value is one */
    asPrimitive(): JsonPrimitive | undefined;
    /** Returns if the underlying value is an object */
    isObject(): boolean;
    /** Returns if the underlying value is an array */
    isArray(): boolean;
    /** Returns if the underlying value is a primitive */
    isPrimitive(): boolean;
    /** Deep clones underlying value */
    clone(): ParsedValue;
    /** Deep clones underlying value, depending on a predicate function */
    cloneWhere(filter: (value: ParsedValue) => boolean): ParsedValue;
    /** Calls the function, with every nested ParsedValue */
    visitAll(callback: (value: ParsedValue) => void): void;
    /** Extracts underlying JSON value from the wrapper */
    toJSON(): Json;
    [inspect.custom](): string;
    toString(): string;
}
/** Same as ParsedValue.parse */
export declare function parseValue(value: Json, source: ConfigSource, extensions?: ParsingExtension[], metadata?: ParsedValueMetadata, context?: ParsingContext): Promise<ParsedValue>;
export {};