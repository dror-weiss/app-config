import { ParsingExtension } from '@app-config/core';
export interface Options {
    command: string;
    failOnStderr: boolean;
    parseOutput: boolean;
    trimWhitespace: boolean;
}
declare function execParsingExtension(): ParsingExtension;
export default execParsingExtension;
