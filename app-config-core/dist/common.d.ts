import { JsonObject } from '@app-config/utils';
export type KeyFormatter = (key: string, separator: string) => string;
/** Strategy used in 'app-config vars' for variable names */
export declare function camelToScreamingCase(key: string, separator?: string): string;
/** Strategy used in 'app-config vars' to extract variable names from hierachy */
export declare function flattenObjectTree(obj: JsonObject, prefix?: string, separator?: string, formatter?: KeyFormatter): {
    [key: string]: string;
};
/** Strategy for renaming keys, used for 'app-config vars' */
export declare function renameInFlattenedTree(flattened: {
    [key: string]: string;
}, renames?: string[], keepOriginalKeys?: boolean): typeof flattened;