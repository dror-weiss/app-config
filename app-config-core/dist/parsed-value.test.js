"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_source_1 = require("./config-source");
const parsed_value_1 = require("./parsed-value");
describe('parseValue', () => {
    it('parses an empty object with no extensions', async () => {
        const source = new config_source_1.LiteralSource({});
        const parsed = await (0, parsed_value_1.parseValue)(await source.readValue(), source, []);
        expect(parsed.raw).toEqual({});
        expect(parsed.toJSON()).toEqual({});
        expect(parsed.meta).toEqual({});
    });
    it('parses an object with no extensions', async () => {
        const source = new config_source_1.LiteralSource({ a: true, b: {}, c: [] });
        const parsed = await (0, parsed_value_1.parseValue)(await source.readValue(), source, []);
        expect(parsed.raw).toEqual({ a: true, b: {}, c: [] });
        expect(parsed.toJSON()).toEqual({ a: true, b: {}, c: [] });
        expect(parsed.meta).toEqual({});
    });
    it('tracks ConfigSource to nested properties', async () => {
        const source = new config_source_1.LiteralSource({ a: { b: { c: [0] } } });
        const parsed = await (0, parsed_value_1.parseValue)(await source.readValue(), source, []);
        expect(parsed.property(['a']).sources[0]).toBe(source);
        expect(parsed.property(['a', 'b']).sources[0]).toBe(source);
        expect(parsed.property(['a', 'b', 'c']).sources[0]).toBe(source);
        expect(parsed.property(['a', 'b', 'c', '0']).sources[0]).toBe(source);
    });
    it('writes metadata to parsed value', async () => {
        const source = new config_source_1.LiteralSource({ a: true });
        const parsed = await (0, parsed_value_1.parseValue)(await source.readValue(), source, [], { special: true });
        expect(parsed.meta).toEqual({ special: true });
        expect(parsed.property(['a']).meta).toEqual({});
    });
    const markAllExtension = (value) => {
        return (parse) => parse(value, { marked: true });
    };
    const markKeyExtension = (value, [keyType, key]) => {
        if (keyType === parsed_value_1.InObject && key === '$mark') {
            return (parse) => parse(value, { shouldFlatten: true, marked: true });
        }
        return false;
    };
    const uppercaseExtension = (value) => {
        if (typeof value === 'string') {
            const uppercase = value.toUpperCase();
            return (parse) => parse(uppercase);
        }
        return false;
    };
    const appendExtension = (suffix) => (value) => {
        if (typeof value === 'string') {
            return (parse) => parse(value + suffix);
        }
        return false;
    };
    const namedAppendExtension = (suffix) => {
        const extension = appendExtension(suffix);
        return Object.assign(extension, {
            extensionName: 'namedAppendExtension',
        });
    };
    const secretExtension = (_, [keyType, key]) => {
        if (keyType === parsed_value_1.InObject && key === '$secret') {
            return (parse) => parse('revealed!', { shouldFlatten: true });
        }
        return false;
    };
    const mergeExtension = (value, [keyType, key]) => {
        if (keyType === parsed_value_1.InObject && key === '$merge') {
            return (parse) => parse(value, { shouldMerge: true });
        }
        return false;
    };
    const overrideExtension = (value, [keyType, key]) => {
        if (keyType === parsed_value_1.InObject && key === '$override') {
            return (parse) => parse(value, { shouldOverride: true });
        }
        return false;
    };
    it('applies a value-based extension', async () => {
        const source = new config_source_1.LiteralSource({ a: { b: 'foo' }, b: 'bar', c: ['baz', 'qux'] });
        const parsed = await (0, parsed_value_1.parseValue)(await source.readValue(), source, [uppercaseExtension]);
        expect(parsed.toJSON()).toEqual({ a: { b: 'FOO' }, b: 'BAR', c: ['BAZ', 'QUX'] });
    });
    it('applies a key-based extension', async () => {
        const source = new config_source_1.LiteralSource({ a: { $secret: 'encoded' } });
        const parsed = await (0, parsed_value_1.parseValue)(await source.readValue(), source, [secretExtension]);
        expect(parsed.toJSON()).toEqual({ a: 'revealed!' });
    });
    it('applies a "marking" extension', async () => {
        const source = new config_source_1.LiteralSource({ a: { b: true }, c: true });
        const parsed = await (0, parsed_value_1.parseValue)(await source.readValue(), source, [markAllExtension]);
        expect(parsed.toJSON()).toEqual({ a: { b: true }, c: true });
        expect(parsed.meta).toEqual({ marked: true });
        expect(parsed.property(['a']).meta).toEqual({ marked: true });
        expect(parsed.property(['a', 'b']).meta).toEqual({ marked: true });
        expect(parsed.property(['c']).meta).toEqual({ marked: true });
    });
    it('passes metadata in a "marking" extension', async () => {
        var _a, _b, _c, _d, _e, _f;
        const value = await parsed_value_1.ParsedValue.parseLiteral({
            a: {
                b: {
                    $mark: {
                        c: true,
                    },
                },
            },
        }, [markKeyExtension]);
        expect((_a = value.property(['a'])) === null || _a === void 0 ? void 0 : _a.meta).toEqual({});
        expect((_b = value.property(['a', 'b'])) === null || _b === void 0 ? void 0 : _b.meta).toEqual({ marked: true });
        expect((_c = value.property(['a', 'b', 'c'])) === null || _c === void 0 ? void 0 : _c.meta).toEqual({});
        expect((_d = value.property(['a'])) === null || _d === void 0 ? void 0 : _d.toJSON()).toEqual({ b: { c: true } });
        expect((_e = value.property(['a', 'b'])) === null || _e === void 0 ? void 0 : _e.toJSON()).toEqual({ c: true });
        expect((_f = value.property(['a', 'b', 'c'])) === null || _f === void 0 ? void 0 : _f.toJSON()).toEqual(true);
    });
    it('applies a merging extension', async () => {
        const source = new config_source_1.LiteralSource({ $merge: { a: false }, a: true, b: true });
        const parsed = await (0, parsed_value_1.parseValue)(await source.readValue(), source, [mergeExtension]);
        expect(parsed.toJSON()).toEqual({ a: true, b: true });
    });
    it('applies a deep merging extension', async () => {
        const source = new config_source_1.LiteralSource({
            $merge: { a: false, c: { d: true, e: false } },
            a: true,
            b: true,
            c: { e: true },
        });
        const parsed = await (0, parsed_value_1.parseValue)(await source.readValue(), source, [mergeExtension]);
        expect(parsed.toJSON()).toEqual({ a: true, b: true, c: { d: true, e: true } });
    });
    it('applies an override extension', async () => {
        const source = new config_source_1.LiteralSource({ $override: { a: true }, a: false, b: true });
        const parsed = await (0, parsed_value_1.parseValue)(await source.readValue(), source, [overrideExtension]);
        expect(parsed.toJSON()).toEqual({ a: true, b: true });
    });
    it('applies an override extension', async () => {
        const source = new config_source_1.LiteralSource({
            $override: { a: true, c: { d: true, e: true } },
            a: false,
            b: true,
            c: { e: false },
        });
        const parsed = await (0, parsed_value_1.parseValue)(await source.readValue(), source, [overrideExtension]);
        expect(parsed.toJSON()).toEqual({ a: true, b: true, c: { d: true, e: true } });
    });
    it('allows the same extension to be applied twice', async () => {
        const source = new config_source_1.LiteralSource('string');
        const parsed = await (0, parsed_value_1.parseValue)(await source.readValue(), source, [
            appendExtension('-appended'),
            appendExtension('-appended2'),
        ]);
        expect(parsed.toJSON()).toEqual('string-appended-appended2');
    });
    it('respects extensionName', async () => {
        const source = new config_source_1.LiteralSource('string');
        const parsed = await (0, parsed_value_1.parseValue)(await source.readValue(), source, [
            namedAppendExtension('-appended'),
            namedAppendExtension('-appended2'),
        ]);
        expect(parsed.toJSON()).toEqual('string-appended');
    });
    it('allows the same extension apply at different levels of a tree', async () => {
        const source = new config_source_1.LiteralSource({ $merge: { $merge: { a: true }, b: true }, c: true });
        const parsed = await (0, parsed_value_1.parseValue)(await source.readValue(), source, [mergeExtension]);
        expect(parsed.toJSON()).toEqual({ a: true, b: true, c: true });
    });
    it('allows the same extension apply at different levels of a tree', async () => {
        const source = new config_source_1.LiteralSource({ $secret: '...' });
        const parsed = await (0, parsed_value_1.parseValue)(await source.readValue(), source, [
            secretExtension,
            markAllExtension,
        ]);
        expect(parsed.toJSON()).toEqual('revealed!');
        expect(parsed.meta).toEqual({ marked: true });
    });
});
describe('ParsedValue', () => {
    it('creates a value from literal JSON', () => {
        const _ = parsed_value_1.ParsedValue.literal({});
    });
    it('can look up property by name using json-like syntax', () => {
        const value = parsed_value_1.ParsedValue.literal({ a: { b: { c: true } } });
        expect(value.property(['a', 'b', 'c']).toJSON()).toEqual(true);
        expect(value.property(['a', 'b']).toJSON()).toEqual({ c: true });
        expect(value.property(['a']).toJSON()).toEqual({ b: { c: true } });
        expect(value.property(['c'])).toBeUndefined();
        expect(value.property(['a', 'c'])).toBeUndefined();
    });
    it('can look up property in array', () => {
        const value = parsed_value_1.ParsedValue.literal({ a: { b: [1, 2, 3] } });
        expect(value.property(['a', 'b']).toJSON()).toEqual([1, 2, 3]);
        expect(value.property(['a', 'b', '0']).toJSON()).toEqual(1);
        expect(value.property(['a', 'b', '2']).toJSON()).toEqual(3);
    });
    it('ignores leading dots in property lookup', () => {
        const value = parsed_value_1.ParsedValue.literal({ a: { b: 3 } });
        expect(value.property('.a.b'.split('.')).toJSON()).toEqual(3);
    });
    it('creates a deep clone in toJSON', () => {
        const literal = { a: { b: { c: true } } };
        const value = parsed_value_1.ParsedValue.literal(literal);
        const jsonified = value.toJSON();
        // raw value is the same
        expect(value.raw).toBe(literal);
        // equal, but not the same
        expect(jsonified).toEqual(literal);
        expect(jsonified).not.toBe(literal);
        expect(jsonified.a).not.toBe(literal.a);
        expect(jsonified.a.b).not.toBe(literal.a.b);
    });
    it('resolves asArray correctly', () => {
        expect(parsed_value_1.ParsedValue.literal({}).asArray()).toBeUndefined();
        expect(parsed_value_1.ParsedValue.literal(null).asArray()).toBeUndefined();
        expect(parsed_value_1.ParsedValue.literal(42).asArray()).toBeUndefined();
        expect(parsed_value_1.ParsedValue.literal('foo').asArray()).toBeUndefined();
        expect(parsed_value_1.ParsedValue.literal([1, 2, 3]).asArray()).toHaveLength(3);
    });
    it('resolves asPrimitive correctly', () => {
        expect(parsed_value_1.ParsedValue.literal({}).asPrimitive()).toBeUndefined();
        expect(parsed_value_1.ParsedValue.literal([1, 2, 3]).asPrimitive()).toBeUndefined();
        expect(parsed_value_1.ParsedValue.literal(null).asPrimitive()).toEqual(null);
        expect(parsed_value_1.ParsedValue.literal(42).asPrimitive()).toEqual(42);
        expect(parsed_value_1.ParsedValue.literal('foo').asPrimitive()).toEqual('foo');
    });
    it('resolves asObject correctly', () => {
        expect(parsed_value_1.ParsedValue.literal({}).asObject()).toEqual({});
        expect(parsed_value_1.ParsedValue.literal([1, 2, 3]).asObject()).toBeUndefined();
        expect(parsed_value_1.ParsedValue.literal(null).asObject()).toBeUndefined();
        expect(parsed_value_1.ParsedValue.literal(42).asObject()).toBeUndefined();
        expect(parsed_value_1.ParsedValue.literal('foo').asObject()).toBeUndefined();
    });
    it('cloneWhere by fromSecrets meta property', () => {
        const value = parsed_value_1.ParsedValue.literal({ a: { b: [1, 2, 3], c: true }, d: { e: true } });
        value.property(['a', 'c']).assignMeta({ fromSecrets: true });
        value.property(['a', 'b', '1']).assignMeta({ fromSecrets: true });
        value.property(['d', 'e']).assignMeta({ fromSecrets: true });
        const nonSecrets = value.cloneWhere((v) => !v.meta.fromSecrets);
        expect(value.toJSON()).toEqual({ a: { b: [1, 2, 3], c: true }, d: { e: true } });
        expect(nonSecrets.toJSON()).toEqual({ a: { b: [1, 3] }, d: {} });
    });
    it('cloneWhere by value type', () => {
        const value = parsed_value_1.ParsedValue.literal({
            a: {},
            b: [],
            c: '',
            d: true,
        });
        expect(value.cloneWhere((v) => v.isObject()).toJSON()).toEqual({ a: {} });
        expect(value.cloneWhere((v) => v.isArray()).toJSON()).toEqual({ b: [] });
        expect(value.cloneWhere((v) => v.isPrimitive()).toJSON()).toEqual({
            c: '',
            d: true,
        });
    });
    it('clones all properties', () => {
        const value = parsed_value_1.ParsedValue.literal({ a: { b: [1, 2, 3], c: true } });
        expect(value.clone().toJSON()).toEqual(value.toJSON());
    });
    it('visits all properties of a deep object', () => {
        const value = parsed_value_1.ParsedValue.literal({
            // 1 visit (root)
            a: {
                // 1 visit
                b: {
                    // 1 visit
                    c: [1, 2, 3], // 1 visit (array) + 3 visits (items)
                },
                d: [], // 1 visit (array) + 0 visits (items)
            },
            e: true,
            f: '', // 1 visit
        });
        expect.assertions(10);
        value.visitAll((item) => expect(item.sources).toEqual(value.sources));
    });
    describe('Merging', () => {
        it('merges two parsed values', () => {
            const a = parsed_value_1.ParsedValue.literal({ a: { b: { c: true } } });
            const b = parsed_value_1.ParsedValue.literal({ a: { b: { d: true } } });
            const merged = parsed_value_1.ParsedValue.merge(a, b);
            expect(a.toJSON()).toEqual({ a: { b: { c: true } } });
            expect(b.toJSON()).toEqual({ a: { b: { d: true } } });
            expect(merged.raw).toEqual({ a: { b: { c: true, d: true } } });
            expect(merged.toJSON()).toEqual({ a: { b: { c: true, d: true } } });
        });
        it('overrides properties when merging', () => {
            const a = parsed_value_1.ParsedValue.literal({ a: true, b: true });
            const b = parsed_value_1.ParsedValue.literal({ a: { b: { d: true } } });
            const value = parsed_value_1.ParsedValue.merge(a, b);
            expect(a).not.toEqual(value);
            expect(b).not.toEqual(value);
            expect(a.toJSON()).not.toEqual(value.toJSON());
            expect(b.toJSON()).not.toEqual(value.toJSON());
            expect(value.toJSON()).toEqual({ a: { b: { d: true } }, b: true });
        });
        it('overrides arrays when merging', () => {
            const a = parsed_value_1.ParsedValue.literal({ a: [] });
            const b = parsed_value_1.ParsedValue.literal({ a: {} });
            expect(parsed_value_1.ParsedValue.merge(a, b).toJSON()).toEqual({ a: {} });
            expect(parsed_value_1.ParsedValue.merge(b, a).toJSON()).toEqual({ a: [] });
        });
        it('merges meta properties', () => {
            const a = parsed_value_1.ParsedValue.literal({ a: true }).assignMeta({ specialK: true });
            const b = parsed_value_1.ParsedValue.literal({ b: true }).assignMeta({ specialP: true });
            const value = parsed_value_1.ParsedValue.merge(a, b);
            expect(value.toJSON()).toEqual({ a: true, b: true });
            expect(value.meta).toEqual({ specialK: true, specialP: true });
        });
        it('merges meta properties in nested properties', () => {
            var _a, _b, _c, _d;
            const a = parsed_value_1.ParsedValue.literal({ a: true });
            const b = parsed_value_1.ParsedValue.literal({ b: true });
            (_a = a.property(['a'])) === null || _a === void 0 ? void 0 : _a.assignMeta({ specialProperty: true });
            (_b = b.property(['b'])) === null || _b === void 0 ? void 0 : _b.assignMeta({ specialProperty: false });
            const merged = parsed_value_1.ParsedValue.merge(a, b);
            expect((_c = merged.property(['a'])) === null || _c === void 0 ? void 0 : _c.meta).toEqual({ specialProperty: true });
            expect((_d = merged.property(['b'])) === null || _d === void 0 ? void 0 : _d.meta).toEqual({ specialProperty: false });
        });
    });
});
//# sourceMappingURL=parsed-value.test.js.map