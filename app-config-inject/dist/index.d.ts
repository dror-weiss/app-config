import { ConfigLoadingOptions } from '@app-config/config';
import { SchemaLoadingOptions } from '@app-config/schema';
export { cli } from './cli';
export interface Options {
    validate: boolean;
    configOptions?: ConfigLoadingOptions;
    schemaOptions?: SchemaLoadingOptions;
}
export declare function injectHtml(html: string, { validate, configOptions, schemaOptions }: Options): Promise<string>;
