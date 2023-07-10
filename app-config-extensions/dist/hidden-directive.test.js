"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@app-config/core");
const hidden_directive_1 = require("./hidden-directive");
const index_1 = require("./index");
describe('$hidden directive', () => {
    it('doesnt include hidden', async () => {
        const source = new core_1.LiteralSource({
            $hidden: {},
        });
        expect(await source.readToJSON([(0, hidden_directive_1.hiddenDirective)()])).toEqual({});
    });
    it('merges hidden', async () => {
        const source = new core_1.LiteralSource({
            $hidden: {},
            foo: true,
        });
        expect(await source.readToJSON([(0, hidden_directive_1.hiddenDirective)()])).toEqual({ foo: true });
    });
    it('references hidden property', async () => {
        const source = new core_1.LiteralSource({
            $hidden: {
                foo: 42,
            },
            baz: {
                $hidden: 44,
            },
            foo: {
                $extendsSelf: '$hidden.foo',
            },
            bar: {
                $extendsSelf: 'baz.$hidden',
            },
        });
        expect(await source.readToJSON([(0, index_1.extendsSelfDirective)(), (0, hidden_directive_1.hiddenDirective)()])).toEqual({
            baz: {},
            foo: 42,
            bar: 44,
        });
    });
    it('references hidden property and processes it', async () => {
        process.env.FOO = 'bar';
        const source = new core_1.LiteralSource({
            $hidden: {
                foo: {
                    $envVar: 'FOO',
                },
            },
            foo: {
                $extendsSelf: '$hidden.foo',
            },
        });
        expect(await source.readToJSON([(0, index_1.extendsSelfDirective)(), (0, hidden_directive_1.hiddenDirective)(), (0, index_1.envVarDirective)()])).toEqual({
            foo: 'bar',
        });
    });
});
//# sourceMappingURL=hidden-directive.test.js.map