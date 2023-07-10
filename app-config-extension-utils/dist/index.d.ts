import type { ParsingContext, ParsingExtension, ParsingExtensionKey, ParsingExtensionTransform } from '@app-config/core';
import { AppConfigError } from '@app-config/core';
import { SchemaBuilder } from '@serafin/schema-builder';
export declare function composeExtensions(extensions: ParsingExtension[]): ParsingExtension;
export declare function named(name: string, parsingExtension: ParsingExtension): ParsingExtension;
export declare function forKey(key: string | string[], parsingExtension: ParsingExtension): ParsingExtension;
export declare function keysToPath(keys: ParsingExtensionKey[]): string;
export declare class ParsingExtensionInvalidOptions extends AppConfigError {
}
export declare function validateOptions<T>(builder: (builder: typeof SchemaBuilder) => SchemaBuilder<T>, extension: (value: T, key: ParsingExtensionKey, parentKeys: ParsingExtensionKey[], context: ParsingContext) => ParsingExtensionTransform | false, { lazy }?: {
    lazy?: boolean;
}): ParsingExtension;
export type ValidationFunction<T> = (value: any, parentKeys: ParsingExtensionKey[]) => asserts value is T;
export declare function validationFunction<T>(builder: (builder: typeof SchemaBuilder) => SchemaBuilder<T>): ValidationFunction<T>;
