import { ParsingContext } from '@app-config/core';
/** A mapping for "alias" names of environments, like "dev" => "development" */
export interface EnvironmentAliases {
    [alias: string]: string;
}
/** Options required for calling {@link currentEnvironment} */
export type EnvironmentOptions = {
    /** Absolute override for what the current environment is, still abiding by aliases */
    override?: string;
    /** A mapping for "alias" names of environments, like "dev" => "development" */
    aliases: EnvironmentAliases;
    /** What environment variable(s) define the current environment, if override is not defined */
    envVarNames: string[];
};
/** Default aliases that app-config will resolve for you */
export declare const defaultAliases: EnvironmentAliases;
/** Default environment variables that app-config will read */
export declare const defaultEnvVarNames: string[];
/** Default options for {@link currentEnvironment} */
export declare const defaultEnvOptions: EnvironmentOptions;
/** Conversion function useful for old usage of the deprecated {@link currentEnvironment} form */
export declare function asEnvOptions(override?: string, aliases?: EnvironmentAliases, environmentSourceNames?: string[] | string): EnvironmentOptions;
/** Retrieve what app-config thinks the current deployment environment is (ie QA, dev, staging, production) */
export declare function currentEnvironment(options?: EnvironmentOptions): string | undefined;
/** @deprecated use currentEnvironment(EnvironmentOptions) instead */
export declare function currentEnvironment(environmentAliases?: EnvironmentAliases, environmentSourceNames?: string[] | string): string | undefined;
/** Reverse lookup of any aliases for some environment */
export declare function aliasesFor(env: string, aliases: EnvironmentAliases): string[];
export declare function environmentOptionsFromContext(context: ParsingContext): EnvironmentOptions | undefined;
export declare function currentEnvFromContext(context: ParsingContext, options?: EnvironmentOptions): string | undefined;
