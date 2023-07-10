"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@app-config/core");
const if_directive_1 = require("./if-directive");
const index_1 = require("./index");
describe('$if directive', () => {
    it('uses main value', async () => {
        const source = new core_1.LiteralSource({
            $if: {
                $check: true,
                $then: 'foobar',
                $else: 'barfoo',
            },
        });
        expect(await source.readToJSON([(0, if_directive_1.ifDirective)()])).toEqual('foobar');
    });
    it('uses fallback value', async () => {
        const source = new core_1.LiteralSource({
            $if: {
                $check: false,
                $then: 'foobar',
                $else: 'barfoo',
            },
        });
        expect(await source.readToJSON([(0, if_directive_1.ifDirective)()])).toEqual('barfoo');
    });
    it('doesnt evaluate the else branch', async () => {
        const source = new core_1.LiteralSource({
            $if: {
                $check: true,
                $then: 'barfoo',
                $else: {
                    $fail: true,
                },
            },
        });
        expect(await source.readToJSON([(0, if_directive_1.ifDirective)()])).toEqual('barfoo');
    });
    it('doesnt evaluate the other branch', async () => {
        const source = new core_1.LiteralSource({
            $if: {
                $check: false,
                $then: {
                    $fail: true,
                },
                $else: 'barfoo',
            },
        });
        expect(await source.readToJSON([(0, if_directive_1.ifDirective)()])).toEqual('barfoo');
    });
    it('disallows missing property', async () => {
        const source = new core_1.LiteralSource({
            $if: {
                $check: false,
                $else: 'barfoo',
            },
        });
        await expect(source.readToJSON([(0, if_directive_1.ifDirective)()])).rejects.toThrow();
    });
    it('parses $check', async () => {
        const source = new core_1.LiteralSource({
            $if: {
                $check: {
                    $env: {
                        default: true,
                    },
                },
                $then: 'foobar',
                $else: 'barfoo',
            },
        });
        expect(await source.readToJSON([(0, if_directive_1.ifDirective)(), (0, index_1.envDirective)()])).toEqual('foobar');
    });
});
//# sourceMappingURL=if-directive.test.js.map