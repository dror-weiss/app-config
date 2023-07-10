"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@app-config/core");
const extension_utils_1 = require("@app-config/extension-utils");
const env_var_directive_1 = require("./env-var-directive");
describe('$envVar directive', () => {
    it('fails with non-string values', async () => {
        const source = new core_1.LiteralSource({ $envVar: {} });
        await expect(source.read([(0, env_var_directive_1.envVarDirective)()])).rejects.toThrow();
    });
    it('does simple environment variable substitution', async () => {
        process.env.FOO = 'foo';
        process.env.BAR = 'bar';
        const source = new core_1.LiteralSource({
            foo: { $envVar: 'FOO' },
            bar: { $envVar: 'BAR' },
        });
        const parsed = await source.read([(0, env_var_directive_1.envVarDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: 'foo', bar: 'bar' });
    });
    it('reads object with name', async () => {
        process.env.FOO = 'foo';
        const source = new core_1.LiteralSource({
            foo: { $envVar: { name: 'FOO' } },
        });
        const parsed = await source.read([(0, env_var_directive_1.envVarDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: 'foo' });
    });
    it('fails with name when not defined', async () => {
        const source = new core_1.LiteralSource({
            foo: { $envVar: { name: 'FOO' } },
        });
        await expect(source.read([(0, env_var_directive_1.envVarDirective)()])).rejects.toThrow();
    });
    it('uses name when fallback is defined', async () => {
        process.env.FOO = 'foo';
        const source = new core_1.LiteralSource({
            foo: { $envVar: { name: 'FOO', fallback: 'bar' } },
        });
        const parsed = await source.read([(0, env_var_directive_1.envVarDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: 'foo' });
    });
    it('uses fallback when name was not found', async () => {
        const source = new core_1.LiteralSource({
            foo: { $envVar: { name: 'FOO', fallback: 'bar' } },
        });
        const parsed = await source.read([(0, env_var_directive_1.envVarDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: 'bar' });
    });
    it('allows null value when allowNull', async () => {
        const source = new core_1.LiteralSource({
            foo: { $envVar: { name: 'FOO', fallback: null, allowNull: true } },
        });
        const parsed = await source.read([(0, env_var_directive_1.envVarDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: null });
    });
    it('does not allow number even when allowNull', async () => {
        const source = new core_1.LiteralSource({
            foo: { $envVar: { name: 'FOO', fallback: 42, allowNull: true } },
        });
        await expect(source.read([(0, env_var_directive_1.envVarDirective)()])).rejects.toThrow();
    });
    it('returns null when allowMissing', async () => {
        process.env.BAR = 'foo';
        const source = new core_1.LiteralSource({
            foo: { $envVar: { name: 'FOO', allowMissing: true } },
            bar: { $envVar: { name: 'BAR', allowMissing: true } },
        });
        const parsed = await source.read([(0, env_var_directive_1.envVarDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: null, bar: 'foo' });
    });
    it('parses ints', async () => {
        process.env.FOO = '11';
        const source = new core_1.LiteralSource({
            $envVar: { name: 'FOO', parseInt: true },
        });
        expect(await source.readToJSON([(0, env_var_directive_1.envVarDirective)()])).toEqual(11);
    });
    it('fails when int is invalid', async () => {
        process.env.FOO = 'not a number';
        const source = new core_1.LiteralSource({
            $envVar: { name: 'FOO', parseInt: true },
        });
        await expect(source.read([(0, env_var_directive_1.envVarDirective)()])).rejects.toThrow();
    });
    it('parses float', async () => {
        process.env.FOO = '11.2';
        const source = new core_1.LiteralSource({
            $envVar: { name: 'FOO', parseFloat: true },
        });
        expect(await source.readToJSON([(0, env_var_directive_1.envVarDirective)()])).toEqual(11.2);
    });
    it('fails when float is invalid', async () => {
        process.env.FOO = 'not a number';
        const source = new core_1.LiteralSource({
            $envVar: { name: 'FOO', parseFloat: true },
        });
        await expect(source.read([(0, env_var_directive_1.envVarDirective)()])).rejects.toThrow();
    });
    it('parses boolean = true', async () => {
        process.env.FOO = 'true';
        const source = new core_1.LiteralSource({
            $envVar: { name: 'FOO', parseBool: true },
        });
        expect(await source.readToJSON([(0, env_var_directive_1.envVarDirective)()])).toEqual(true);
    });
    it('parses boolean = 1', async () => {
        process.env.FOO = '1';
        const source = new core_1.LiteralSource({
            $envVar: { name: 'FOO', parseBool: true },
        });
        expect(await source.readToJSON([(0, env_var_directive_1.envVarDirective)()])).toEqual(true);
    });
    it('parses boolean = 0', async () => {
        process.env.FOO = '0';
        const source = new core_1.LiteralSource({
            $envVar: { name: 'FOO', parseBool: true },
        });
        expect(await source.readToJSON([(0, env_var_directive_1.envVarDirective)()])).toEqual(false);
    });
    it('parses boolean = false', async () => {
        process.env.FOO = 'false';
        const source = new core_1.LiteralSource({
            $envVar: { name: 'FOO', parseBool: true },
        });
        expect(await source.readToJSON([(0, env_var_directive_1.envVarDirective)()])).toEqual(false);
    });
    it('doesnt visit fallback if name is defined', async () => {
        const failDirective = (0, extension_utils_1.forKey)('$fail', () => () => {
            throw new Error();
        });
        process.env.FOO = 'foo';
        const source = new core_1.LiteralSource({
            foo: { $envVar: { name: 'FOO', fallback: { fail: true } } },
        });
        const parsed = await source.read([(0, env_var_directive_1.envVarDirective)(), failDirective]);
        expect(parsed.toJSON()).toEqual({ foo: 'foo' });
    });
    it('reads special case name APP_CONFIG_ENV', async () => {
        process.env.NODE_ENV = 'qa';
        const source = new core_1.LiteralSource({
            foo: { $envVar: { name: 'APP_CONFIG_ENV' } },
        });
        const parsed = await source.read([(0, env_var_directive_1.envVarDirective)()]);
        expect(parsed.toJSON()).toEqual({ foo: 'qa' });
    });
    it('parses boolean from fallback', async () => {
        const source = new core_1.LiteralSource({
            $envVar: { name: 'FOO', parseBool: true, fallback: 'true' },
        });
        expect(await source.readToJSON([(0, env_var_directive_1.envVarDirective)()])).toEqual(true);
    });
});
//# sourceMappingURL=env-var-directive.test.js.map