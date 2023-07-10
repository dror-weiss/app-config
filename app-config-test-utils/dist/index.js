"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockedStdin = exports.withTempFiles = void 0;
const path_1 = require("path");
const tmp_promise_1 = require("tmp-promise");
const fs_extra_1 = require("fs-extra");
const mock_stdin_1 = require("mock-stdin");
const logging_1 = require("@app-config/logging");
const utils_1 = require("@app-config/utils");
async function withTempFiles(files, callback) {
    const { path: folder } = await (0, tmp_promise_1.dir)();
    try {
        const entries = Array.isArray(files) ? files : Object.entries(files);
        for (const [filename, contents] of entries) {
            await (0, fs_extra_1.outputFile)((0, path_1.join)(folder, filename), contents);
        }
        await callback((filename) => (0, path_1.join)(folder, filename), folder);
    }
    finally {
        await (0, fs_extra_1.remove)(folder).catch((error) => {
            // eslint-disable-next-line no-console
            console.warn(error);
            // we'll just ignore this, it's spurious in CI
            if (utils_1.isWindows &&
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                error.code !== 'EBUSY') {
                throw error;
            }
        });
    }
}
exports.withTempFiles = withTempFiles;
async function mockedStdin(callback) {
    const mock = (0, mock_stdin_1.stdin)();
    (0, logging_1.isTestEnvAndShouldNotPrompt)(false);
    process.stdin.isTTY = true;
    process.stdout.isTTY = true;
    // to keep test output clean, just mock out stdout.write
    const origWrite = process.stdout.write;
    const mockWrite = jest.fn();
    process.stdout.write = mockWrite;
    try {
        const send = (text) => new Promise((resolve) => {
            setTimeout(() => {
                mock.send(text);
                mock.send('\n');
                resolve();
            }, 0);
        });
        await callback(send, () => mock.end());
    }
    finally {
        (0, logging_1.isTestEnvAndShouldNotPrompt)(true);
        process.stdin.isTTY = false;
        process.stdout.isTTY = false;
        process.stdout.write = origWrite;
        mock.restore();
    }
}
exports.mockedStdin = mockedStdin;
//# sourceMappingURL=index.js.map