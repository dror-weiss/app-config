#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cli = void 0;
const yargs = __importStar(require("yargs"));
const logging_1 = require("@app-config/logging");
const node_1 = require("@app-config/node");
const index_1 = require("./index");
// we can't have it interfere with our stdout
(0, logging_1.setLogLevel)(logging_1.LogLevel.None);
exports.cli = yargs
    .strict()
    .version()
    .help('h', 'Shows help message with examples and options')
    .alias('h', 'help')
    .command({
    command: '*',
    describe: 'Reads HTML from stdin and outputs to stdout',
    builder: (args) => args
        .option('validate', {
        type: 'boolean',
        default: true,
        alias: 'v',
        description: 'Whether config should be checked against the schema',
    })
        .option('dir', {
        type: 'string',
        description: 'Where to find the app-config file',
    })
        .option('schema-dir', {
        type: 'string',
        description: 'Where to find the app-config schema, if validating',
    }),
    async handler({ validate, dir, schemaDir, }) {
        const html = await (0, node_1.consumeStdin)();
        const injected = await (0, index_1.injectHtml)(html, {
            validate,
            configOptions: { directory: dir },
            schemaOptions: { directory: schemaDir },
        });
        process.stdout.write(injected);
        process.stdout.write('\n');
        process.stderr.write('Injected HTML from stdin!\n');
    },
});
if (require.main === module) {
    exports.cli.parse();
}
//# sourceMappingURL=cli.js.map