"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const core_1 = require("@app-config/core");
const test_utils_1 = require("@app-config/test-utils");
const index_1 = require("./index");
describe('meta file loading', () => {
    it('gracefully fails when meta file is missing', async () => {
        const meta = await (0, index_1.loadMetaConfig)();
        expect(meta.value).toEqual({});
        expect(meta.filePath).toBeUndefined();
        expect(meta.fileType).toBeUndefined();
    });
    it('loads a simple meta file', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.meta.yml': `
          foo: bar
        `,
        }, async (inDir) => {
            const meta = await (0, index_1.loadMetaConfig)({ directory: inDir('.') });
            expect(meta.value).toEqual({ foo: 'bar' });
            expect(meta.filePath).toBe(inDir('.app-config.meta.yml'));
            expect(meta.fileType).toBe(core_1.FileType.YAML);
        });
    });
    it('loads a meta file from the workspace root', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.meta.yml': `
          foo: bar
        `,
        }, async (inDir) => {
            await (0, fs_extra_1.mkdirp)(inDir('.git'));
            await (0, fs_extra_1.mkdirp)(inDir('nested-folder/a/b/c'));
            const meta = await (0, index_1.loadMetaConfig)({ directory: inDir('nested-folder/a/b/c') });
            expect(meta.value).toEqual({ foo: 'bar' });
            expect(meta.filePath).toBe(inDir('.app-config.meta.yml'));
            expect(meta.fileType).toBe(core_1.FileType.YAML);
        });
    });
    it('loads a meta file from a custom workspace root', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.meta.yml': `
          foo: bar
        `,
        }, async (inDir) => {
            await (0, fs_extra_1.mkdirp)(inDir('.svn'));
            await (0, fs_extra_1.mkdirp)(inDir('nested-folder/a/b/c'));
            const meta = await (0, index_1.loadMetaConfig)({
                lookForWorkspace: '.svn',
                directory: inDir('nested-folder/a/b/c'),
            });
            expect(meta.value).toEqual({ foo: 'bar' });
            expect(meta.filePath).toBe(inDir('.app-config.meta.yml'));
            expect(meta.fileType).toBe(core_1.FileType.YAML);
        });
    });
    it('uses $extends in a meta file', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.meta.yml': `
          foo: qux
          $extends: ./other-file.yml
        `,
            'other-file.yml': `
          foo: bar
          bar: baz
        `,
        }, async (inDir) => {
            const meta = await (0, index_1.loadMetaConfig)({ directory: inDir('.') });
            expect(meta.value).toEqual({ foo: 'qux', bar: 'baz' });
            expect(meta.filePath).toBe(inDir('.app-config.meta.yml'));
            expect(meta.fileType).toBe(core_1.FileType.YAML);
        });
    });
    it('uses $override in a meta file', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.meta.yml': `
          foo: qux
          $override: ./other-file.yml
        `,
            'other-file.yml': `
          foo: bar
          bar: baz
        `,
        }, async (inDir) => {
            const meta = await (0, index_1.loadMetaConfig)({ directory: inDir('.') });
            expect(meta.value).toEqual({ foo: 'bar', bar: 'baz' });
            expect(meta.filePath).toBe(inDir('.app-config.meta.yml'));
            expect(meta.fileType).toBe(core_1.FileType.YAML);
        });
    });
    it('ignores meta file in workspace root when passed lookForWorkspace=false', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.meta.yml': `
          foo: bar
        `,
        }, async (inDir) => {
            await (0, fs_extra_1.mkdirp)(inDir('.git'));
            await (0, fs_extra_1.mkdirp)(inDir('nested-folder/a/b/c'));
            const meta = await (0, index_1.loadMetaConfig)({
                lookForWorkspace: false,
                directory: inDir('nested-folder/a/b/c'),
            });
            expect(meta.value).toEqual({});
            expect(meta.filePath).toBeUndefined();
            expect(meta.fileType).toBeUndefined();
        });
    });
    it('loads a meta file from a nested folder in a workspace', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.meta.yml': `
          foo: baz
        `,
            'a/b/c/.app-config.meta.yml': `
          foo: bar
        `,
        }, async (inDir) => {
            await (0, fs_extra_1.mkdirp)(inDir('.git'));
            const meta = await (0, index_1.loadMetaConfig)({ directory: inDir('a/b/c') });
            expect(meta.value).toEqual({ foo: 'bar' });
            expect(meta.filePath).toBe(inDir('a/b/c/.app-config.meta.yml'));
            expect(meta.fileType).toBe(core_1.FileType.YAML);
        });
    });
    it('bubbles up and does not ignore a NotFoundError from transitively included files', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.meta.yml': `
          $extends: a-missing-file.yml
        `,
        }, async (inDir) => {
            await expect((0, index_1.loadMetaConfig)({ directory: inDir('.') })).rejects.toThrow(`File ${inDir('a-missing-file.yml')} not found`);
        });
    });
});
//# sourceMappingURL=index.test.js.map