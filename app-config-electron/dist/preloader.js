"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const util_1 = require("util");
const logging_1 = require("@app-config/logging");
let additionalPreload;
let config;
for (const arg of process.argv) {
    if (arg.startsWith('--user-preload=')) {
        additionalPreload = arg.substr(15);
    }
    if (arg.startsWith('--app-config=')) {
        try {
            config = JSON.parse(arg.substr(13));
        }
        catch (err) {
            logging_1.logger.error(`Got invalid JSON from config: ${(0, util_1.inspect)(err)}`);
        }
    }
}
if (config) {
    electron_1.contextBridge.exposeInMainWorld('_appConfig', config);
    logging_1.logger.info(`⚙️ Injected app-config`);
}
// This seems to be how electron does preload scripts https://github.com/electron/electron/issues/2406 maybe there's a better way?
/* eslint-disable import/no-dynamic-require, global-require */
if (additionalPreload) {
    require(additionalPreload);
}
//# sourceMappingURL=preloader.js.map