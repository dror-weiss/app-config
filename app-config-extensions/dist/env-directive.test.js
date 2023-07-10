"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@app-config/core");
const extension_utils_1 = require("@app-config/extension-utils");
const env_directive_1 = require("./env-directive");
describe('$env directive', () => {
    it('fails when not in an environment', async () => {
        const source = new core_1.LiteralSource({ $env: {} });
        await expect(source.read([(0, env_directive_1.envDirective)()])).rejects.toThrow();
    });
    it('fails when no options match current environment', async () => {
        process.env.NODE_ENV = 'test';
        const source = new core_1.LiteralSource({ $env: { dev: true } });
        await expect(source.read([(0, env_directive_1.envDirective)()])).rejects.toThrow();
    });
    it('fails when options is not an object', async () => {
        const source = new core_1.LiteralSource({
            foo: {
                $env: 'invalid',
            },
        });
        await expect(source.read([(0, env_directive_1.envDirective)()])).rejects.toThrow();
    });
    it('resolves to default environment', async () => {
        const source = new core_1.LiteralSource({ $env: { default: 42 } });
        const parsed = await source.read([(0, env_directive_1.envDirective)()]);
        expect(parsed.toJSON()).toEqual(42);
    });
    it('fails to resolve with no current environment', async () => {
        process.env.NODE_ENV = undefined;
        const source = new core_1.LiteralSource({ $env: { test: 42 } });
        await expect(source.read([(0, env_directive_1.envDirective)()])).rejects.toThrow();
    });
    it('resolves to default with no current environment', async () => {
        process.env.NODE_ENV = undefined;
        const source = new core_1.LiteralSource({ $env: { default: 42 } });
        expect(await source.readToJSON([(0, env_directive_1.envDirective)()])).toBe(42);
    });
    it('resolves to test environment', async () => {
        process.env.NODE_ENV = 'test';
        const source = new core_1.LiteralSource({ $env: { test: 84, default: 42 } });
        const parsed = await source.read([(0, env_directive_1.envDirective)()]);
        expect(parsed.toJSON()).toEqual(84);
    });
    it('resolves to environment alias', async () => {
        process.env.NODE_ENV = 'development';
        const source = new core_1.LiteralSource({ $env: { dev: 84, default: 42 } });
        const parsed = await source.read([(0, env_directive_1.envDirective)()]);
        expect(parsed.toJSON()).toEqual(84);
    });
    it('uses environment alias', async () => {
        process.env.NODE_ENV = 'dev';
        const source = new core_1.LiteralSource({ $env: { development: 84, default: 42 } });
        const parsed = await source.read([(0, env_directive_1.envDirective)()]);
        expect(parsed.toJSON()).toEqual(84);
    });
    it('resolves to object', async () => {
        process.env.NODE_ENV = 'test';
        const source = new core_1.LiteralSource({
            $env: { test: { testing: true }, default: { testing: false } },
        });
        const parsed = await source.read([(0, env_directive_1.envDirective)()]);
        expect(parsed.toJSON()).toEqual({ testing: true });
    });
    it('resolves to null', async () => {
        process.env.NODE_ENV = 'test';
        const source = new core_1.LiteralSource({
            $env: { test: null },
        });
        const parsed = await source.read([(0, env_directive_1.envDirective)()]);
        expect(parsed.toJSON()).toEqual(null);
    });
    it('uses the none option', async () => {
        delete process.env.NODE_ENV;
        const source = new core_1.LiteralSource({
            $env: { default: 1, none: 2 },
        });
        const parsed = await source.read([(0, env_directive_1.envDirective)()]);
        expect(parsed.toJSON()).toEqual(2);
    });
    it('uses the default over the none option when env is defined', async () => {
        process.env.NODE_ENV = 'test';
        const source = new core_1.LiteralSource({
            $env: { default: 1, none: 2 },
        });
        const parsed = await source.read([(0, env_directive_1.envDirective)()]);
        expect(parsed.toJSON()).toEqual(1);
    });
    it('doesnt evaluate non-current environment', async () => {
        const failDirective = (0, extension_utils_1.forKey)('$fail', () => () => {
            throw new Error();
        });
        process.env.NODE_ENV = 'test';
        const source = new core_1.LiteralSource({
            $env: { test: null, dev: { $fail: true } },
        });
        const parsed = await source.read([(0, env_directive_1.envDirective)(), failDirective]);
        expect(parsed.toJSON()).toEqual(null);
    });
    it('merges selection with sibling keys', async () => {
        const source = new core_1.LiteralSource({
            sibling: true,
            testing: false,
            $env: {
                test: { testing: true },
                default: { testing: false },
            },
        });
        process.env.NODE_ENV = 'test';
        const parsed = await source.read([(0, env_directive_1.envDirective)()]);
        expect(parsed.toJSON()).toEqual({ sibling: true, testing: true });
        process.env.NODE_ENV = 'development';
        const parsed2 = await source.read([(0, env_directive_1.envDirective)()]);
        expect(parsed2.toJSON()).toEqual({ sibling: true, testing: false });
    });
});
//# sourceMappingURL=env-directive.test.js.map