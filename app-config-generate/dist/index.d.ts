import { RendererOptions } from 'quicktype-core';
import { MetaLoadingOptions } from '@app-config/meta';
import { JSONSchema, SchemaLoadingOptions } from '@app-config/schema';
export interface Options {
    directory?: string;
    schemaOptions?: SchemaLoadingOptions;
    metaOptions?: MetaLoadingOptions;
}
export declare function generateTypeFiles({ directory, schemaOptions, metaOptions }?: Options): Promise<import("@app-config/meta").GenerateFile[]>;
export declare function generateQuicktype(schema: JSONSchema, type: string, name: string, augmentModule?: boolean | string, leadingCommentsOverride?: string[], rendererOptions?: RendererOptions): Promise<string[]>;
