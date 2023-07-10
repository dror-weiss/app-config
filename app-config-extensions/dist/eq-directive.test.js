"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@app-config/core");
const eq_directive_1 = require("./eq-directive");
const index_1 = require("./index");
describe('$eq directive', () => {
    it('returns true for empty', async () => {
        const source = new core_1.LiteralSource({
            $eq: [],
        });
        expect(await source.readToJSON([(0, eq_directive_1.eqDirective)()])).toBe(true);
    });
    it('returns true for two numbers', async () => {
        const source = new core_1.LiteralSource({
            $eq: [42, 42],
        });
        expect(await source.readToJSON([(0, eq_directive_1.eqDirective)()])).toBe(true);
    });
    it('returns false for two numbers', async () => {
        const source = new core_1.LiteralSource({
            $eq: [42, 44],
        });
        expect(await source.readToJSON([(0, eq_directive_1.eqDirective)()])).toBe(false);
    });
    it('returns true for two objects', async () => {
        const source = new core_1.LiteralSource({
            $eq: [{ a: true }, { a: true }],
        });
        expect(await source.readToJSON([(0, eq_directive_1.eqDirective)()])).toBe(true);
    });
    it('returns false for two objects', async () => {
        const source = new core_1.LiteralSource({
            $eq: [{ a: true }, { b: true }],
        });
        expect(await source.readToJSON([(0, eq_directive_1.eqDirective)()])).toBe(false);
    });
    it('parses before checking equality', async () => {
        process.env.APP_CONFIG_ENV = 'test';
        const source = new core_1.LiteralSource({
            $eq: [{ $env: { default: { a: true } } }, { $env: { test: { a: true } } }],
        });
        expect(await source.readToJSON([(0, eq_directive_1.eqDirective)(), (0, index_1.envDirective)()])).toBe(true);
    });
});
//# sourceMappingURL=eq-directive.test.js.map