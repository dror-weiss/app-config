import type { ParsingExtension } from '@app-config/main';
export interface Options {
    address?: string;
    token?: string;
    namespace?: string;
}
declare function vaultParsingExtension(options?: Options): ParsingExtension;
export default vaultParsingExtension;
