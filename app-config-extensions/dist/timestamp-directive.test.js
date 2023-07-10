"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@app-config/core");
const timestamp_directive_1 = require("./timestamp-directive");
describe('$timestamp directive', () => {
    it('uses the current date', async () => {
        const now = new Date();
        const source = new core_1.LiteralSource({
            now: { $timestamp: true },
        });
        const parsed = await source.read([(0, timestamp_directive_1.timestampDirective)(() => now)]);
        expect(parsed.toJSON()).toEqual({ now: now.toISOString() });
    });
    it('uses locale date string', async () => {
        const now = new Date(2020, 11, 25, 8, 30, 0);
        const source = new core_1.LiteralSource({
            now: {
                $timestamp: {
                    locale: 'en-US',
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                },
            },
        });
        const parsed = await source.read([(0, timestamp_directive_1.timestampDirective)(() => now)]);
        expect(parsed.toJSON()).toEqual({ now: 'Friday, December 25, 2020' });
    });
    it('rejects a bad option', async () => {
        const now = new Date();
        const source = new core_1.LiteralSource({
            now: { $timestamp: null },
        });
        await expect(source.read([(0, timestamp_directive_1.timestampDirective)(() => now)])).rejects.toThrow();
    });
    it('rejects a bad locale', async () => {
        const now = new Date();
        const source = new core_1.LiteralSource({
            now: { $timestamp: { locale: null } },
        });
        await expect(source.read([(0, timestamp_directive_1.timestampDirective)(() => now)])).rejects.toThrow();
    });
});
//# sourceMappingURL=timestamp-directive.test.js.map