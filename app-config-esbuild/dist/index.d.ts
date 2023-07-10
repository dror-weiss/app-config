import type { Plugin } from 'esbuild';
import { ConfigLoadingOptions } from '@app-config/config';
import { SchemaLoadingOptions } from '@app-config/schema';
export interface Options {
    useGlobalNamespace?: boolean;
    loadingOptions?: ConfigLoadingOptions;
    schemaLoadingOptions?: SchemaLoadingOptions;
    injectValidationFunction?: boolean;
    noBundledConfig?: boolean;
}
export declare const createPlugin: ({ useGlobalNamespace, loadingOptions, schemaLoadingOptions, injectValidationFunction, noBundledConfig, }?: Options) => Plugin;
export default createPlugin;
