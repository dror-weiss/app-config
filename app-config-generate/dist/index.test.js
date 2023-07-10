"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const test_utils_1 = require("@app-config/test-utils");
const index_1 = require("./index");
describe('TypeScript File Generation', () => {
    it('creates a simple TypeScript file', async () => {
        const schema = {
            type: 'object',
            additionalProperties: false,
            properties: {
                foo: { type: 'string' },
            },
        };
        const generated = await (0, index_1.generateQuicktype)(schema, 'ts', 'Configuration');
        expect(generated).toMatchSnapshot();
    });
    it('creates a TypeScript file from meta file properties', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.meta.json5': `{
          generate: [
            {
              file: "generated.d.ts",
              name: "MyCustomConfigName"
            }
          ]
        }`,
            '.app-config.schema.json5': `{
          type: "object",
          properties: {
            x: { type: "number" }
          },
        }`,
        }, async (dir) => {
            const output = await (0, index_1.generateTypeFiles)({ directory: dir('.') });
            expect(output.length).toBe(1);
            const config = await (0, fs_extra_1.readFile)(dir('generated.d.ts')).then((v) => v.toString());
            expect(config).toMatchSnapshot();
        });
    });
    it('creates a TypeScript file from schema with many $ref properties', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.meta.json5': `{
          generate: [
            {
              file: "generated.d.ts"
            }
          ]
        }`,
            '.app-config.schema.json5': `{
          type: "object",
          properties: {
            root: { type: "boolean" },
            a: { $ref: "./a.yml" },
          },
        }`,
            'a.yml': `
          required: [b]
          type: object
          properties:
            b: { $ref: './-/-/b.yml' }
        `,
            '-/-/b.yml': `
          required: [c]
          type: object
          properties:
            c: { $ref: '../../c.yml' }
        `,
            'c.yml': `
          required: [d]
          type: object
          properties:
            d: { type: boolean }
        `,
        }, async (dir) => {
            const output = await (0, index_1.generateTypeFiles)({ directory: dir('.') });
            expect(output.length).toBe(1);
            const config = await (0, fs_extra_1.readFile)(dir('generated.d.ts')).then((v) => v.toString());
            expect(config).toMatchSnapshot();
        });
    });
    it('corrects Date type in TypeScript files', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.meta.json5': `{
          generate: [
            {
              file: "generated.d.ts",
              name: "MyCustomConfigName"
            }
          ]
        }`,
            '.app-config.schema.json5': `{
          type: "object",
          properties: {
            x: { type: "string", format: "date" }
          },
        }`,
        }, async (dir) => {
            const output = await (0, index_1.generateTypeFiles)({ directory: dir('.') });
            expect(output.length).toBe(1);
            const config = await (0, fs_extra_1.readFile)(dir('generated.d.ts')).then((v) => v.toString());
            expect(config).toMatch('x?: string');
            expect(config).toMatchSnapshot();
        });
    });
    it('corrects date with multiple space', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.meta.json5': `{
          generate: [{ file: "generated.d.ts" }]
        }`,
            '.app-config.schema.yaml': `
          type: object
          additionalProperties: false
          required:
            - commit
            - date

          properties:
            commit:
              type: string

            date:
              type: string
              format: date-time
        `,
        }, async (dir) => {
            const output = await (0, index_1.generateTypeFiles)({ directory: dir('.') });
            expect(output.length).toBe(1);
            const config = await (0, fs_extra_1.readFile)(dir('generated.d.ts')).then((v) => v.toString());
            expect(config).toMatch('date: string');
            expect(config).toMatchSnapshot();
        });
    });
    it('uses single quotes in enum values', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.meta.json5': `{
          generate: [{ file: "generated.d.ts" }]
        }`,
            '.app-config.schema.yaml': `
          type: object
          additionalProperties: false

          properties:
            commit:
              type: string
              enum:
                - foo
                - foo-bar
        `,
        }, async (dir) => {
            const output = await (0, index_1.generateTypeFiles)({ directory: dir('.') });
            expect(output.length).toBe(1);
            const config = await (0, fs_extra_1.readFile)(dir('generated.d.ts')).then((v) => v.toString());
            expect(config).toMatch(`Foo = 'foo'`);
            expect(config).toMatch(`FooBar = 'foo-bar'`);
        });
    });
    it('creates an empty interface for config', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.meta.yml': `
          generate:
            - file: generated.d.ts
        `,
            '.app-config.schema.yml': ``,
        }, async (inDir) => {
            const output = await (0, index_1.generateTypeFiles)({ directory: inDir('.') });
            expect(output.length).toBe(1);
            const config = await (0, fs_extra_1.readFile)(inDir('generated.d.ts')).then((v) => v.toString());
            expect(config).toMatch('interface Config {}');
        });
    });
    it('augements specific module name', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.meta.yml': `
          generate:
            - file: generated.d.ts
              augmentModule: foo-bar
        `,
            '.app-config.schema.yml': ``,
        }, async (inDir) => {
            await (0, index_1.generateTypeFiles)({ directory: inDir('.') });
            const config = await (0, fs_extra_1.readFile)(inDir('generated.d.ts')).then((v) => v.toString());
            expect(config).toMatch(`declare module 'foo-bar'`);
        });
    });
});
describe('Flow File Generation', () => {
    it('creates a simple flow file', async () => {
        const schema = {
            type: 'object',
            additionalProperties: false,
            properties: {
                foo: { type: 'string' },
            },
        };
        const generated = await (0, index_1.generateQuicktype)(schema, 'flow', 'Configuration');
        expect(generated).toMatchSnapshot();
    });
});
describe('Golang File Generation', () => {
    it('creates a simple Go file', async () => {
        const schema = {
            type: 'object',
            additionalProperties: false,
            properties: {
                foo: { type: 'string' },
            },
        };
        const generated = await (0, index_1.generateQuicktype)(schema, 'go', 'Configuration');
        expect(generated).toMatchSnapshot();
    });
    it('creates a Go file without singleton', async () => {
        const schema = {
            type: 'object',
            additionalProperties: false,
            properties: {
                foo: { type: 'string' },
            },
        };
        const generated = await (0, index_1.generateQuicktype)(schema, 'go', 'Configuration', undefined, undefined, {
            'no-singleton': 'true',
        });
        expect(generated).toMatchSnapshot();
    });
});
describe('Rust File Generation', () => {
    it('creates a simple Rust file', async () => {
        const schema = {
            type: 'object',
            additionalProperties: false,
            properties: {
                foo: { type: 'string' },
            },
        };
        const generated = await (0, index_1.generateQuicktype)(schema, 'rust', 'Configuration');
        expect(generated).toMatchSnapshot();
    });
});
//# sourceMappingURL=index.test.js.map