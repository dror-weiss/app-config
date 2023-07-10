"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_source_1 = require("./config-source");
const errors_1 = require("./errors");
class FailingSource extends config_source_1.ConfigSource {
    readContents() {
        throw new errors_1.NotFoundError();
    }
}
const flattenExtension = (value, [_, key]) => {
    if (key === '$flatten') {
        return (parse) => parse(value, { shouldFlatten: true });
    }
    return false;
};
const uppercaseExtension = (value) => {
    if (typeof value === 'string') {
        return (parse) => parse(value.toUpperCase());
    }
    return false;
};
describe('Parsing', () => {
    it('interprets an empty object', async () => {
        const source = new config_source_1.LiteralSource({});
        const parsed = await source.read();
        expect(parsed.sources[0]).toBe(source);
        expect(parsed.raw).toEqual({});
        expect(parsed.toJSON()).toEqual({});
        expect(parsed.toString()).toEqual('{}');
    });
    it('uses parsing extensions', async () => {
        const parsed = await new config_source_1.LiteralSource({
            $flatten: 'bar',
        }).read([flattenExtension]);
        expect(parsed.toJSON()).toEqual('bar');
    });
    it('uses parsing extensions in nested objects', async () => {
        const parsed = await new config_source_1.LiteralSource({
            foo: {
                $flatten: 'bar',
            },
        }).read([flattenExtension]);
        expect(parsed.toJSON()).toEqual({ foo: 'bar' });
    });
    it('uses value transform extension', async () => {
        const parsed = await new config_source_1.LiteralSource({
            foo: 'bar',
        }).read([uppercaseExtension]);
        expect(parsed.toJSON()).toEqual({ foo: 'BAR' });
    });
    it('uses multiple extensions', async () => {
        const parsed = await new config_source_1.LiteralSource({
            foo: {
                $flatten: 'bar',
            },
        }).read([flattenExtension, uppercaseExtension]);
        expect(parsed.toJSON()).toEqual({ foo: 'BAR' });
    });
    it('uses readToJSON shorthand', async () => {
        const parsed = await new config_source_1.LiteralSource({
            foo: {
                $flatten: 'bar',
            },
        }).readToJSON([flattenExtension]);
        expect(parsed).toEqual({ foo: 'bar' });
    });
    it('loads using readContents correctly', async () => {
        const [text, fileType] = await new config_source_1.LiteralSource({ foo: 'bar' }).readContents();
        expect([text, fileType]).toMatchSnapshot();
    });
});
describe('CombinedSource', () => {
    it('fails when no sources are provided', () => {
        expect(() => new config_source_1.CombinedSource([])).toThrow();
    });
    it('combines a few sources', async () => {
        const source = new config_source_1.CombinedSource([
            new config_source_1.LiteralSource({ foo: 1 }),
            new config_source_1.LiteralSource({ bar: 2 }),
            new config_source_1.LiteralSource({ baz: 3 }),
        ]);
        const parsed = await source.read();
        expect(parsed.sources[0]).toBe(source);
        expect(parsed.toJSON()).toEqual({ foo: 1, bar: 2, baz: 3 });
    });
    it('loads using readContents correctly', async () => {
        const [text, fileType] = await new config_source_1.CombinedSource([
            new config_source_1.LiteralSource({ foo: 1 }),
            new config_source_1.LiteralSource({ bar: 2 }),
            new config_source_1.LiteralSource({ baz: 3 }),
        ]).readContents();
        expect([text, fileType]).toMatchSnapshot();
    });
    it('loads using readValue correctly', async () => {
        const value = await new config_source_1.CombinedSource([
            new config_source_1.LiteralSource({ foo: 1 }),
            new config_source_1.LiteralSource({ bar: 2 }),
            new config_source_1.LiteralSource({ baz: 3 }),
        ]).readValue();
        expect(value).toEqual({ foo: 1, bar: 2, baz: 3 });
    });
});
describe('FallbackSource', () => {
    it('fails when no sources are provided', () => {
        expect(() => new config_source_1.FallbackSource([])).toThrow();
    });
    it('selects the first source', async () => {
        const source = new config_source_1.FallbackSource([
            new config_source_1.LiteralSource({ foo: 1 }),
            new config_source_1.LiteralSource({ bar: 2 }),
            new config_source_1.LiteralSource({ baz: 3 }),
        ]);
        const parsed = await source.read();
        expect(parsed.sources[0]).toBe(source.sources[0]);
        expect(parsed.toJSON()).toEqual({ foo: 1 });
    });
    it('selects source when first one fails', async () => {
        const source = new config_source_1.FallbackSource([
            new FailingSource(),
            new config_source_1.LiteralSource({ bar: 2 }),
            new config_source_1.LiteralSource({ baz: 3 }),
        ]);
        const parsed = await source.read();
        expect(parsed.sources[0]).toBe(source.sources[1]);
        expect(parsed.toJSON()).toEqual({ bar: 2 });
    });
    it('loads using readContents correctly', async () => {
        const [text, fileType] = await new config_source_1.FallbackSource([
            new config_source_1.LiteralSource({ foo: 1 }),
            new config_source_1.LiteralSource({ bar: 2 }),
            new config_source_1.LiteralSource({ baz: 3 }),
        ]).readContents();
        expect([text, fileType]).toMatchSnapshot();
    });
    it('loads using readValue correctly', async () => {
        const value = await new config_source_1.FallbackSource([
            new config_source_1.LiteralSource({ foo: 1 }),
            new config_source_1.LiteralSource({ bar: 2 }),
            new config_source_1.LiteralSource({ baz: 3 }),
        ]).readValue();
        expect(value).toEqual({ foo: 1 });
    });
});
describe('stringify', () => {
    it('stringifies JSON', () => {
        expect((0, config_source_1.stringify)({ foo: 'bar' }, config_source_1.FileType.JSON)).toMatchSnapshot();
    });
    it('stringifies JSON5', () => {
        expect((0, config_source_1.stringify)({ foo: 'bar' }, config_source_1.FileType.JSON5)).toMatchSnapshot();
    });
    it('stringifies YAML', () => {
        expect((0, config_source_1.stringify)({ foo: 'bar' }, config_source_1.FileType.YAML)).toMatchSnapshot();
    });
    it('stringifies TOML', () => {
        expect((0, config_source_1.stringify)({ foo: 'bar' }, config_source_1.FileType.TOML)).toMatchSnapshot();
    });
    it('stringifies RAW', () => {
        // RAW only stringifies primitive values
        expect((0, config_source_1.stringify)(11, config_source_1.FileType.RAW)).toMatchSnapshot();
        expect((0, config_source_1.stringify)('foobar', config_source_1.FileType.RAW)).toMatchSnapshot();
        expect((0, config_source_1.stringify)(true, config_source_1.FileType.RAW)).toMatchSnapshot();
    });
});
//# sourceMappingURL=config-source.test.js.map