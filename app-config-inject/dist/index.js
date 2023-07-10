"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectHtml = exports.cli = void 0;
const node_html_parser_1 = require("node-html-parser");
const config_1 = require("@app-config/config");
var cli_1 = require("./cli");
Object.defineProperty(exports, "cli", { enumerable: true, get: function () { return cli_1.cli; } });
async function injectHtml(html, { validate, configOptions, schemaOptions }) {
    const parsed = (0, node_html_parser_1.parse)(html);
    const scriptTag = parsed.querySelector('script[id="app-config"]');
    if (!scriptTag) {
        throw new Error('No <script id="app-config"> was found in the given HTML!');
    }
    let config;
    let environment;
    if (validate) {
        ({ fullConfig: config, environment } = await (0, config_1.loadValidatedConfig)(configOptions, schemaOptions));
    }
    else {
        ({ fullConfig: config, environment } = await (0, config_1.loadUnvalidatedConfig)(configOptions));
    }
    const configString = JSON.stringify(config);
    const environmentString = environment ? JSON.stringify(environment) : 'undefined';
    scriptTag.set_content(`window._appConfig=${configString}, window._appConfigEnvironment=${environmentString}`);
    return parsed.toString();
}
exports.injectHtml = injectHtml;
//# sourceMappingURL=index.js.map