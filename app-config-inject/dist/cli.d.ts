#!/usr/bin/env node
import * as yargs from 'yargs';
export declare const cli: yargs.Argv<{
    validate: boolean;
} & {
    dir: string | undefined;
} & {
    "schema-dir": string | undefined;
}>;
