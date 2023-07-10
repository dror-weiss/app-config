"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@app-config/core");
const extension_utils_1 = require("@app-config/extension-utils");
const substitute_directive_1 = require("./substitute-directive");
/* eslint-disable no-template-curly-in-string */
describe('$substitute directive', () => {
    it('fails with non-string values', async () => {
        const source = new core_1.LiteralSource({ $substitute: {} });
        await expect(source.read([(0, substitute_directive_1.substituteDirective)()])).rejects.toThrow();
    });
    it('does simple environment variable substitution', async () => {
        process.env.FOO = 'foo';
        process.env.BAR = 'bar';
        const source = new core_1.LiteralSource({
            foo: { $substitute: '$FOO' },
            bar: { $substitute: '$BAR' },
        });
        const parsed = await source.read([(0, substitute_directive_1.substituteDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: 'foo', bar: 'bar' });
    });
    it('uses $subs shorthand', async () => {
        process.env.FOO = 'bar';
        const source = new core_1.LiteralSource({
            foo: { $subs: '$FOO' },
        });
        const parsed = await source.read([(0, substitute_directive_1.substituteDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: 'bar' });
    });
    it('does environment variable substitution fallback', async () => {
        const source = new core_1.LiteralSource({
            foo: { $substitute: '${FOO:-baz}' },
        });
        const parsed = await source.read([(0, substitute_directive_1.substituteDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: 'baz' });
    });
    it('does environment variable substitution with empty value', async () => {
        process.env.FOO = '';
        const source = new core_1.LiteralSource({
            foo: { $substitute: '${FOO}' },
        });
        const parsed = await source.read([(0, substitute_directive_1.substituteDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: '' });
    });
    it('does environment variable substitution with empty fallback', async () => {
        const source = new core_1.LiteralSource({
            foo: { $substitute: '${FOO:-}' },
        });
        const parsed = await source.read([(0, substitute_directive_1.substituteDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: '' });
    });
    it('flows through nested substitution', async () => {
        process.env.BAR = 'qux';
        const source = new core_1.LiteralSource({
            foo: { $substitute: '${FOO:-${BAR}}' },
        });
        const parsed = await source.read([(0, substitute_directive_1.substituteDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: 'qux' });
    });
    it('does variable substitutions mid-string', async () => {
        process.env.FOO = 'foo';
        const source = new core_1.LiteralSource({
            foo: { $substitute: 'bar ${FOO} bar' },
        });
        const parsed = await source.read([(0, substitute_directive_1.substituteDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: 'bar foo bar' });
    });
    it('does multiple variable substitutions', async () => {
        process.env.FOO = 'foo';
        process.env.BAR = 'bar';
        const source = new core_1.LiteralSource({
            foo: { $substitute: '${FOO} $BAR' },
        });
        const parsed = await source.read([(0, substitute_directive_1.substituteDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: 'foo bar' });
    });
    it('does multiple variable substitutions with fallbacks', async () => {
        process.env.FOO = 'foo';
        const source = new core_1.LiteralSource({
            foo: { $substitute: '${FOO} ${BAR:-bar}' },
        });
        const parsed = await source.read([(0, substitute_directive_1.substituteDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: 'foo bar' });
    });
    it('does variable substitution in array', async () => {
        process.env.FOO = 'foo';
        const source = new core_1.LiteralSource({
            foo: [{ $substitute: '${FOO}' }, 'bar'],
        });
        const parsed = await source.read([(0, substitute_directive_1.substituteDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: ['foo', 'bar'] });
    });
    it('reads special case variable $APP_CONFIG_ENV', async () => {
        process.env.NODE_ENV = 'qa';
        const source = new core_1.LiteralSource({
            foo: { $subs: '${APP_CONFIG_ENV}' },
        });
        const parsed = await source.read([(0, substitute_directive_1.substituteDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: 'qa' });
    });
    it('reads special case name APP_CONFIG_ENV', async () => {
        process.env.NODE_ENV = 'qa';
        const source = new core_1.LiteralSource({
            foo: { $subs: { name: 'APP_CONFIG_ENV' } },
        });
        const parsed = await source.read([(0, substitute_directive_1.substituteDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: 'qa' });
    });
    it('reads object with $name', async () => {
        process.env.FOO = 'foo';
        const source = new core_1.LiteralSource({
            foo: { $substitute: { $name: 'FOO' } },
        });
        const parsed = await source.read([(0, substitute_directive_1.substituteDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: 'foo' });
    });
    it('fails with $name when not defined', async () => {
        const source = new core_1.LiteralSource({
            foo: { $substitute: { $name: 'FOO' } },
        });
        await expect(source.read([(0, substitute_directive_1.substituteDirective)()])).rejects.toThrow();
    });
    it('uses $name when $fallback is defined', async () => {
        process.env.FOO = 'foo';
        const source = new core_1.LiteralSource({
            foo: { $substitute: { $name: 'FOO', $fallback: 'bar' } },
        });
        const parsed = await source.read([(0, substitute_directive_1.substituteDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: 'foo' });
    });
    it('uses $fallback when $name was not found', async () => {
        const source = new core_1.LiteralSource({
            foo: { $substitute: { $name: 'FOO', $fallback: 'bar' } },
        });
        const parsed = await source.read([(0, substitute_directive_1.substituteDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: 'bar' });
    });
    it('allows null value when $allowNull', async () => {
        const source = new core_1.LiteralSource({
            foo: { $substitute: { $name: 'FOO', $fallback: null, $allowNull: true } },
        });
        const parsed = await source.read([(0, substitute_directive_1.substituteDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: null });
    });
    it('does not allow number even when $allowNull', async () => {
        const source = new core_1.LiteralSource({
            foo: { $substitute: { $name: 'FOO', $fallback: 42, $allowNull: true } },
        });
        await expect(source.read([(0, substitute_directive_1.substituteDirective)()])).rejects.toThrow();
    });
    it('parses ints', async () => {
        process.env.FOO = '11';
        const source = new core_1.LiteralSource({
            $substitute: { $name: 'FOO', $parseInt: true },
        });
        expect(await source.readToJSON([(0, substitute_directive_1.substituteDirective)()])).toEqual(11);
    });
    it('fails when int is invalid', async () => {
        process.env.FOO = 'not a number';
        const source = new core_1.LiteralSource({
            $substitute: { $name: 'FOO', $parseInt: true },
        });
        await expect(source.read([(0, substitute_directive_1.substituteDirective)()])).rejects.toThrow();
    });
    it('parses float', async () => {
        process.env.FOO = '11.2';
        const source = new core_1.LiteralSource({
            $substitute: { $name: 'FOO', $parseFloat: true },
        });
        expect(await source.readToJSON([(0, substitute_directive_1.substituteDirective)()])).toEqual(11.2);
    });
    it('fails when float is invalid', async () => {
        process.env.FOO = 'not a number';
        const source = new core_1.LiteralSource({
            $substitute: { $name: 'FOO', $parseFloat: true },
        });
        await expect(source.read([(0, substitute_directive_1.substituteDirective)()])).rejects.toThrow();
    });
    it('parses boolean = true', async () => {
        process.env.FOO = 'true';
        const source = new core_1.LiteralSource({
            $substitute: { $name: 'FOO', $parseBool: true },
        });
        expect(await source.readToJSON([(0, substitute_directive_1.substituteDirective)()])).toEqual(true);
    });
    it('parses boolean = 1', async () => {
        process.env.FOO = '1';
        const source = new core_1.LiteralSource({
            $substitute: { $name: 'FOO', $parseBool: true },
        });
        expect(await source.readToJSON([(0, substitute_directive_1.substituteDirective)()])).toEqual(true);
    });
    it('parses boolean = 0', async () => {
        process.env.FOO = '0';
        const source = new core_1.LiteralSource({
            $substitute: { $name: 'FOO', $parseBool: true },
        });
        expect(await source.readToJSON([(0, substitute_directive_1.substituteDirective)()])).toEqual(false);
    });
    it('parses boolean = false', async () => {
        process.env.FOO = 'false';
        const source = new core_1.LiteralSource({
            $substitute: { $name: 'FOO', $parseBool: true },
        });
        expect(await source.readToJSON([(0, substitute_directive_1.substituteDirective)()])).toEqual(false);
    });
    it('doesnt visit fallback if name is defined', async () => {
        const failDirective = (0, extension_utils_1.forKey)('$fail', () => () => {
            throw new Error();
        });
        process.env.FOO = 'foo';
        const source = new core_1.LiteralSource({
            foo: { $substitute: { $name: 'FOO', $fallback: { $fail: true } } },
        });
        const parsed = await source.read([(0, substitute_directive_1.substituteDirective)(), failDirective]);
        expect(parsed.toJSON()).toEqual({ foo: 'foo' });
    });
    it('reads object with name', async () => {
        process.env.FOO = 'foo';
        const source = new core_1.LiteralSource({
            foo: { $substitute: { name: 'FOO' } },
        });
        const parsed = await source.read([(0, substitute_directive_1.substituteDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: 'foo' });
    });
    it('fails with name when not defined', async () => {
        const source = new core_1.LiteralSource({
            foo: { $substitute: { name: 'FOO' } },
        });
        await expect(source.read([(0, substitute_directive_1.substituteDirective)()])).rejects.toThrow();
    });
    it('uses name when fallback is defined', async () => {
        process.env.FOO = 'foo';
        const source = new core_1.LiteralSource({
            foo: { $substitute: { name: 'FOO', fallback: 'bar' } },
        });
        const parsed = await source.read([(0, substitute_directive_1.substituteDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: 'foo' });
    });
    it('uses fallback when name was not found', async () => {
        const source = new core_1.LiteralSource({
            foo: { $substitute: { name: 'FOO', fallback: 'bar' } },
        });
        const parsed = await source.read([(0, substitute_directive_1.substituteDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: 'bar' });
    });
    it('allows null value when allowNull', async () => {
        const source = new core_1.LiteralSource({
            foo: { $substitute: { name: 'FOO', fallback: null, allowNull: true } },
        });
        const parsed = await source.read([(0, substitute_directive_1.substituteDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: null });
    });
    it('does not allow number even when allowNull', async () => {
        const source = new core_1.LiteralSource({
            foo: { $substitute: { name: 'FOO', fallback: 42, allowNull: true } },
        });
        await expect(source.read([(0, substitute_directive_1.substituteDirective)()])).rejects.toThrow();
    });
    it('parses ints', async () => {
        process.env.FOO = '11';
        const source = new core_1.LiteralSource({
            $substitute: { name: 'FOO', parseInt: true },
        });
        expect(await source.readToJSON([(0, substitute_directive_1.substituteDirective)()])).toEqual(11);
    });
    it('fails when int is invalid', async () => {
        process.env.FOO = 'not a number';
        const source = new core_1.LiteralSource({
            $substitute: { name: 'FOO', parseInt: true },
        });
        await expect(source.read([(0, substitute_directive_1.substituteDirective)()])).rejects.toThrow();
    });
    it('parses float', async () => {
        process.env.FOO = '11.2';
        const source = new core_1.LiteralSource({
            $substitute: { name: 'FOO', parseFloat: true },
        });
        expect(await source.readToJSON([(0, substitute_directive_1.substituteDirective)()])).toEqual(11.2);
    });
    it('fails when float is invalid', async () => {
        process.env.FOO = 'not a number';
        const source = new core_1.LiteralSource({
            $substitute: { name: 'FOO', parseFloat: true },
        });
        await expect(source.read([(0, substitute_directive_1.substituteDirective)()])).rejects.toThrow();
    });
    it('parses boolean = true', async () => {
        process.env.FOO = 'true';
        const source = new core_1.LiteralSource({
            $substitute: { name: 'FOO', parseBool: true },
        });
        expect(await source.readToJSON([(0, substitute_directive_1.substituteDirective)()])).toEqual(true);
    });
    it('parses boolean = 1', async () => {
        process.env.FOO = '1';
        const source = new core_1.LiteralSource({
            $substitute: { name: 'FOO', parseBool: true },
        });
        expect(await source.readToJSON([(0, substitute_directive_1.substituteDirective)()])).toEqual(true);
    });
    it('parses boolean = 0', async () => {
        process.env.FOO = '0';
        const source = new core_1.LiteralSource({
            $substitute: { name: 'FOO', parseBool: true },
        });
        expect(await source.readToJSON([(0, substitute_directive_1.substituteDirective)()])).toEqual(false);
    });
    it('parses boolean = false', async () => {
        process.env.FOO = 'false';
        const source = new core_1.LiteralSource({
            $substitute: { name: 'FOO', parseBool: true },
        });
        expect(await source.readToJSON([(0, substitute_directive_1.substituteDirective)()])).toEqual(false);
    });
    it('doesnt visit fallback if name is defined', async () => {
        const failDirective = (0, extension_utils_1.forKey)('$fail', () => () => {
            throw new Error();
        });
        process.env.FOO = 'foo';
        const source = new core_1.LiteralSource({
            foo: { $substitute: { name: 'FOO', fallback: { $fail: true } } },
        });
        const parsed = await source.read([(0, substitute_directive_1.substituteDirective)(), failDirective]);
        expect(parsed.toJSON()).toEqual({ foo: 'foo' });
    });
});
//# sourceMappingURL=substitute-directive.test.js.map