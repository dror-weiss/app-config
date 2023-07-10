export declare const isBrowser: boolean;
export declare const isNode: boolean;
export declare const isWindows: boolean;
export declare const packageNameRegex: RegExp;
export declare const appConfigImportRegex: RegExp;
export type JsonPrimitive = number | string | boolean | null;
export interface JsonObject {
    [key: string]: Json;
}
export interface JsonArray extends Array<Json> {
}
export type Json = JsonPrimitive | JsonArray | JsonObject;
export declare function isObject(obj: Json): obj is JsonObject;
export declare function isPrimitive(obj: Json): obj is JsonPrimitive;
export declare function generateModuleText(fullConfig: Json | undefined, { environment, useGlobalNamespace, validationFunctionCode, esmValidationCode, }: {
    environment: string | undefined;
    useGlobalNamespace: boolean;
    validationFunctionCode?(): string;
    validationFunctionCode?(esm: true): [string, string];
    esmValidationCode: boolean;
}): string;
