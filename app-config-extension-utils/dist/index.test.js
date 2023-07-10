"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@app-config/core");
const index_1 = require("./index");
const foo = (0, index_1.forKey)('$foo', () => (parse) => parse('foo!'));
const bar = (0, index_1.forKey)('$bar', () => (parse) => parse('bar!'));
const plusOne = (0, index_1.forKey)(['+1', '$plusOne'], (value) => (parse) => parse(value + 1, { shouldFlatten: true }));
describe('forKey', () => {
    it('only applies for keys given', async () => {
        const source = {
            a: {
                b: {
                    $plusOne: 33,
                },
                c: {
                    '+1': 1,
                },
                d: {
                    $foo: 'bar',
                },
            },
        };
        expect(await new core_1.LiteralSource(source).readToJSON([foo, bar, plusOne])).toEqual({
            a: {
                b: 34,
                c: 2,
                d: {
                    $foo: 'foo!',
                },
            },
        });
    });
});
describe('composeExtensions', () => {
    it('combines two extensions', async () => {
        const source = {
            $foo: 1,
            $bar: 2,
        };
        expect(await new core_1.LiteralSource(source).readToJSON([foo, bar])).toEqual({
            $foo: 'foo!',
            $bar: 'bar!',
        });
        const combined = (0, index_1.composeExtensions)([foo, bar]);
        expect(await new core_1.LiteralSource(source).readToJSON([combined])).toEqual({
            $foo: 'foo!',
            $bar: 'bar!',
        });
    });
    it('combines two extensions, and applies them in nested properties', async () => {
        const source = {
            $foo: 1,
            a: {
                b: {
                    $bar: 2,
                },
            },
        };
        expect(await new core_1.LiteralSource(source).readToJSON([foo, bar])).toEqual({
            $foo: 'foo!',
            a: {
                b: {
                    $bar: 'bar!',
                },
            },
        });
        const combined = (0, index_1.composeExtensions)([foo, bar]);
        expect(await new core_1.LiteralSource(source).readToJSON([combined])).toEqual({
            $foo: 'foo!',
            a: {
                b: {
                    $bar: 'bar!',
                },
            },
        });
    });
});
describe('validateOptions', () => {
    const ext1 = (0, index_1.validateOptions)((SchemaBuilder) => SchemaBuilder.stringSchema(), (value) => (parse) => parse(`${value}!`, { shouldFlatten: true }));
    const ext2 = (0, index_1.validateOptions)((SchemaBuilder) => SchemaBuilder.integerSchema(), (value) => (parse) => parse(value + 42, { shouldFlatten: true }));
    const ext3 = (0, index_1.forKey)('$ext3', (0, index_1.validateOptions)((SchemaBuilder) => SchemaBuilder.integerSchema(), (value) => (parse) => parse(value + 42, { shouldFlatten: true })));
    it('allows valid options', async () => {
        expect(await new core_1.LiteralSource('start').readToJSON([ext1])).toEqual('start!');
        expect(await new core_1.LiteralSource(42).readToJSON([ext2])).toEqual(84);
    });
    it('disallows invalid options', async () => {
        await expect(new core_1.LiteralSource(42).readToJSON([ext1])).rejects.toThrow(index_1.ParsingExtensionInvalidOptions);
        await expect(new core_1.LiteralSource('start').readToJSON([ext2])).rejects.toThrow(index_1.ParsingExtensionInvalidOptions);
    });
    it('composes forKey and validateOptions', async () => {
        expect(await new core_1.LiteralSource('start').readToJSON([ext3])).toEqual('start');
        expect(await new core_1.LiteralSource({ $ext3: 0 }).readToJSON([ext3])).toEqual(42);
        await expect(new core_1.LiteralSource({ $ext3: 'start' }).readToJSON([ext3])).rejects.toThrow('Validation failed in "$ext3": Invalid parameters: data should be integer');
        await expect(new core_1.LiteralSource({ a: { $ext3: 'start' } }).readToJSON([ext3])).rejects.toThrow('Validation failed in "a.$ext3": Invalid parameters: data should be integer');
    });
});
//# sourceMappingURL=index.test.js.map