"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@app-config/core");
const parse_directive_1 = require("./parse-directive");
describe('$parseBool', () => {
    it('should parse an existing boolean value', async () => {
        await expect(new core_1.LiteralSource({ $parseBool: true }).readToJSON([(0, parse_directive_1.parseDirective)()])).resolves.toBe(true);
        await expect(new core_1.LiteralSource({ $parseBool: false }).readToJSON([(0, parse_directive_1.parseDirective)()])).resolves.toBe(false);
    });
    it('should parse string values', async () => {
        await expect(new core_1.LiteralSource({ $parseBool: 'true' }).readToJSON([(0, parse_directive_1.parseDirective)()])).resolves.toBe(true);
        await expect(new core_1.LiteralSource({ $parseBool: 'false' }).readToJSON([(0, parse_directive_1.parseDirective)()])).resolves.toBe(false);
        await expect(new core_1.LiteralSource({ $parseBool: '1' }).readToJSON([(0, parse_directive_1.parseDirective)()])).resolves.toBe(true);
        await expect(new core_1.LiteralSource({ $parseBool: '0' }).readToJSON([(0, parse_directive_1.parseDirective)()])).resolves.toBe(false);
        await expect(new core_1.LiteralSource({ $parseBool: 'null' }).readToJSON([(0, parse_directive_1.parseDirective)()])).resolves.toBe(false);
    });
    it('should parse null as false', async () => {
        await expect(new core_1.LiteralSource({ $parseBool: null }).readToJSON([(0, parse_directive_1.parseDirective)()])).resolves.toBe(false);
    });
    it('should parse numbers', async () => {
        await expect(new core_1.LiteralSource({ $parseBool: 1 }).readToJSON([(0, parse_directive_1.parseDirective)()])).resolves.toBe(true);
        await expect(new core_1.LiteralSource({ $parseBool: 0 }).readToJSON([(0, parse_directive_1.parseDirective)()])).resolves.toBe(false);
    });
});
describe('$parseFloat', () => {
    it('should parse an existing number value', async () => {
        await expect(new core_1.LiteralSource({ $parseFloat: 12.12 }).readToJSON([(0, parse_directive_1.parseDirective)()])).resolves.toBe(12.12);
        await expect(new core_1.LiteralSource({ $parseFloat: 0 }).readToJSON([(0, parse_directive_1.parseDirective)()])).resolves.toBe(0);
    });
    it('should parse string values', async () => {
        await expect(new core_1.LiteralSource({ $parseFloat: '12.12' }).readToJSON([(0, parse_directive_1.parseDirective)()])).resolves.toBe(12.12);
        await expect(new core_1.LiteralSource({ $parseFloat: '0' }).readToJSON([(0, parse_directive_1.parseDirective)()])).resolves.toBe(0);
    });
    it('should reject invalid values', async () => {
        await expect(new core_1.LiteralSource({ $parseFloat: 'not a number' }).readToJSON([(0, parse_directive_1.parseDirective)()])).rejects.toThrow('Failed to $parseFloat');
        await expect(new core_1.LiteralSource({ $parseFloat: null }).readToJSON([(0, parse_directive_1.parseDirective)()])).rejects.toThrow('Failed to $parseFloat');
        await expect(new core_1.LiteralSource({ $parseFloat: [] }).readToJSON([(0, parse_directive_1.parseDirective)()])).rejects.toThrow('Failed to $parseFloat');
    });
});
describe('$parseInt', () => {
    it('should parse an existing number value', async () => {
        await expect(new core_1.LiteralSource({ $parseInt: 12.12 }).readToJSON([(0, parse_directive_1.parseDirective)()])).resolves.toBe(12);
        await expect(new core_1.LiteralSource({ $parseInt: 0 }).readToJSON([(0, parse_directive_1.parseDirective)()])).resolves.toBe(0);
    });
    it('should parse string values', async () => {
        await expect(new core_1.LiteralSource({ $parseInt: '12.12' }).readToJSON([(0, parse_directive_1.parseDirective)()])).resolves.toBe(12);
        await expect(new core_1.LiteralSource({ $parseInt: '0' }).readToJSON([(0, parse_directive_1.parseDirective)()])).resolves.toBe(0);
    });
    it('should reject invalid values', async () => {
        await expect(new core_1.LiteralSource({ $parseInt: 'not a number' }).readToJSON([(0, parse_directive_1.parseDirective)()])).rejects.toThrow('Failed to $parseInt');
        await expect(new core_1.LiteralSource({ $parseInt: null }).readToJSON([(0, parse_directive_1.parseDirective)()])).rejects.toThrow('Failed to $parseInt');
        await expect(new core_1.LiteralSource({ $parseInt: [] }).readToJSON([(0, parse_directive_1.parseDirective)()])).rejects.toThrow('Failed to $parseInt');
    });
});
//# sourceMappingURL=parse-directive.test.js.map