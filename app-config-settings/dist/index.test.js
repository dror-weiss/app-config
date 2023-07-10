"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_utils_1 = require("@app-config/test-utils");
const index_1 = require("./index");
describe('Loading and saving', () => {
    it('saves and loads settings', () => (0, test_utils_1.withTempFiles)({}, async (inDir) => {
        process.env.APP_CONFIG_SETTINGS_FOLDER = inDir('settings');
        expect((0, index_1.settingsDirectory)()).toEqual(inDir('settings'));
        await (0, index_1.saveSettings)({});
        await expect((0, index_1.loadSettings)()).resolves.toEqual({});
    }));
});
//# sourceMappingURL=index.test.js.map