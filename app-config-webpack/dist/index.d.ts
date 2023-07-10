import { Compiler } from 'webpack';
import type { ConfigLoadingOptions, SchemaLoadingOptions } from '@app-config/main';
import { regex } from './loader';
declare const loader: string;
export interface Options {
    headerInjection?: boolean;
    useGlobalNamespace?: boolean;
    loadingOptions?: ConfigLoadingOptions;
    schemaLoadingOptions?: SchemaLoadingOptions;
    intercept?: RegExp;
    injectValidationFunction?: boolean;
    noBundledConfig?: boolean;
    /** @deprecated use useGlobalNamespace instead */
    noGlobal?: boolean;
    /** @deprecated use loadingOptions instead */
    loading?: ConfigLoadingOptions;
    /** @deprecated use schemaLoadingOptions instead */
    schemaLoading?: SchemaLoadingOptions;
}
export default class AppConfigPlugin implements Options {
    headerInjection: boolean;
    useGlobalNamespace: boolean;
    loadingOptions?: ConfigLoadingOptions;
    schemaLoadingOptions?: SchemaLoadingOptions;
    injectValidationFunction: boolean;
    noBundledConfig: boolean;
    intercept: RegExp;
    constructor(options?: Options);
    static loader: string;
    static regex: RegExp;
    apply(compiler: Compiler): void;
    interceptImports(compiler: Compiler): void;
    injectHead(compiler: Compiler): void;
}
export { regex, loader };
