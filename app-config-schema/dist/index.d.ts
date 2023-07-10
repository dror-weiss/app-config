import { ValidateFunction } from 'ajv';
import { JSONSchema } from 'json-schema-ref-parser';
import { JsonObject } from '@app-config/utils';
import { ParsedValue, ParsingExtension } from '@app-config/core';
import { EnvironmentAliases } from '@app-config/node';
export { JSONSchema };
export interface SchemaLoadingOptions {
    directory?: string;
    fileNameBase?: string;
    environmentVariableName?: string;
    environmentOverride?: string;
    environmentAliases?: EnvironmentAliases;
    environmentSourceNames?: string[] | string;
    parsingExtensions?: ParsingExtension[];
}
export type Validate = (fullConfig: JsonObject, parsed?: ParsedValue) => void;
export interface Schema {
    schema: JSONSchema;
    validate: Validate;
    validationFunctionCode(): string;
    validationFunctionCode(esm: true): [string, string];
    validationFunctionModule(): string;
    validationFunctionModule(esm: true): [string, string];
    validationFunction: ValidateFunction;
}
export declare function loadSchema({ directory, fileNameBase, environmentVariableName, environmentOverride, environmentAliases, environmentSourceNames, parsingExtensions, }?: SchemaLoadingOptions): Promise<Schema>;