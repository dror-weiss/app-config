"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const test_utils_1 = require("@app-config/test-utils");
const index_1 = require("./index");
beforeEach(() => (0, index_1.resetConfigInternal)());
describe('loadConfig', () => {
    it('throws an error when accessing config before loadConfig is called', () => {
        expect(() => {
            const { foo: _ } = index_1.config;
        }).toThrow();
    });
    it('loads configuration', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.yml': `foo: 42`,
            '.app-config.schema.yml': `type: object`,
        }, async (inDir) => {
            const loaded = await (0, index_1.loadConfig)({ directory: inDir('.') });
            expect(loaded).toEqual(index_1.config);
            expect(loaded).toEqual({ foo: 42 });
            expect(Object.assign({}, loaded)).toEqual(loaded);
            expect(Object.keys(loaded)).toEqual(['foo']);
            expect(JSON.stringify(loaded)).toEqual(JSON.stringify({ foo: 42 }));
        });
    });
    it('calls toJSON correctly', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.yml': `foo: 42`,
            '.app-config.schema.yml': `type: object`,
        }, async (inDir) => {
            const loaded = await (0, index_1.loadConfig)({ directory: inDir('.') });
            expect((0, util_1.inspect)(loaded)).toEqual((0, util_1.inspect)({ foo: 42 }));
        });
    });
    it('allows deep property access', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.yml': `foo: { bar: { baz: 88 } }`,
            '.app-config.schema.yml': `type: object`,
        }, async (inDir) => {
            const loaded = (await (0, index_1.loadConfig)({
                directory: inDir('.'),
            }));
            expect(loaded.foo.bar).toEqual({ baz: 88 });
            expect(loaded.foo.bar.baz).toEqual(88);
        });
    });
    it('lists root level keys correctly', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.schema.yml': `type: object`,
            '.app-config.yml': `
          a: true
          b: true
          c: true
        `,
        }, async (inDir) => {
            const loaded = (await (0, index_1.loadConfig)({
                directory: inDir('.'),
            }));
            expect(Object.keys(loaded)).toEqual(['a', 'b', 'c']);
        });
    });
    it("responds to 'in' operator", async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.schema.yml': `type: object`,
            '.app-config.yml': `
          a: true
          b: true
          c: true
        `,
        }, async (inDir) => {
            const loaded = (await (0, index_1.loadConfig)({
                directory: inDir('.'),
            }));
            expect('a' in loaded).toBe(true);
            expect('b' in loaded).toBe(true);
            expect('c' in loaded).toBe(true);
        });
    });
    it('disallows property deletion or mutation', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.schema.yml': `type: object`,
            '.app-config.yml': `foo: 88`,
        }, async (inDir) => {
            const loaded = (await (0, index_1.loadConfig)({
                directory: inDir('.'),
            }));
            expect(() => {
                delete loaded.foo;
            }).toThrow();
            expect(() => {
                loaded.foo = 99;
            }).toThrow();
            expect(() => {
                loaded.foo = undefined;
            }).toThrow();
        });
    });
    it('disallows defineProperty', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.schema.yml': `type: object`,
            '.app-config.yml': `foo: 88`,
        }, async (inDir) => {
            const loaded = await (0, index_1.loadConfig)({ directory: inDir('.') });
            expect(() => {
                Object.defineProperty(loaded, 'foo', { value: 99 });
            }).toThrow();
        });
    });
});
describe('mockConfig', () => {
    it('mocks out the config expert', async () => {
        (0, index_1.mockConfig)({ foo: 'bar' });
        expect(index_1.config).toEqual({ foo: 'bar' });
        await expect(() => (0, index_1.loadConfig)()).rejects.toThrow();
    });
});
//# sourceMappingURL=index.test.js.map