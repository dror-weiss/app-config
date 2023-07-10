"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@app-config/core");
const extension_utils_1 = require("@app-config/extension-utils");
const try_directive_1 = require("./try-directive");
describe('$try directive', () => {
    it('uses main value', async () => {
        const source = new core_1.LiteralSource({
            $try: {
                $value: 'foobar',
                $fallback: 'barfoo',
            },
        });
        expect(await source.readToJSON([(0, try_directive_1.tryDirective)()])).toEqual('foobar');
    });
    it('uses fallback value', async () => {
        const failDirective = (0, extension_utils_1.forKey)('$fail', () => () => {
            throw new core_1.Fallbackable();
        });
        const source = new core_1.LiteralSource({
            $try: {
                $value: {
                    $fail: true,
                },
                $fallback: 'barfoo',
            },
        });
        expect(await source.readToJSON([(0, try_directive_1.tryDirective)(), failDirective])).toEqual('barfoo');
    });
    it('doesnt evaluate fallback if value works', async () => {
        const failDirective = (0, extension_utils_1.forKey)('$fail', () => () => {
            throw new core_1.Fallbackable();
        });
        const source = new core_1.LiteralSource({
            $try: {
                $value: 'barfoo',
                $fallback: {
                    $fail: true,
                },
            },
        });
        expect(await source.readToJSON([(0, try_directive_1.tryDirective)(), failDirective])).toEqual('barfoo');
    });
    it('doesnt swallow plain errors', async () => {
        const failDirective = (0, extension_utils_1.forKey)('$fail', () => () => {
            throw new Error();
        });
        const source = new core_1.LiteralSource({
            $try: {
                $value: {
                    $fail: true,
                },
                $fallback: 'barfoo',
            },
        });
        await expect(source.readToJSON([(0, try_directive_1.tryDirective)(), failDirective])).rejects.toThrow(Error);
    });
    it('swallows plain errors with "unsafe" option', async () => {
        const failDirective = (0, extension_utils_1.forKey)('$fail', () => () => {
            throw new Error();
        });
        const source = new core_1.LiteralSource({
            $try: {
                $value: {
                    $fail: true,
                },
                $fallback: 'barfoo',
                $unsafe: true,
            },
        });
        expect(await source.readToJSON([(0, try_directive_1.tryDirective)(), failDirective])).toEqual('barfoo');
    });
});
//# sourceMappingURL=try-directive.test.js.map