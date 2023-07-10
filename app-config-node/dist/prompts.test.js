"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_utils_1 = require("@app-config/test-utils");
const prompts_1 = require("./prompts");
describe('promptUserWithRetry', () => {
    it('accepts first valid response', async () => {
        await (0, test_utils_1.mockedStdin)(async (send) => {
            send('bar').catch(() => { });
            await (0, prompts_1.promptUserWithRetry)({ type: 'text', message: 'Foo?' }, async (answer) => {
                expect(answer).toBe('bar');
                return true;
            });
        });
    });
    it('rejects after 3 tries', async () => {
        await (0, test_utils_1.mockedStdin)(async (send) => {
            send('bar')
                .then(() => send('bar'))
                .then(() => send('bar'))
                .catch(() => { });
            await expect((0, prompts_1.promptUserWithRetry)({ type: 'text', message: 'Foo?' }, async () => new Error('Nope'))).rejects.toBeTruthy();
        });
    });
});
describe('consumeStdin', () => {
    it('consumes all lines until end', async () => {
        await (0, test_utils_1.mockedStdin)(async (send, end) => {
            send('foo')
                .then(() => send('bar'))
                .then(() => send('baz'))
                .then(() => end())
                .catch(() => { });
            expect(await (0, prompts_1.consumeStdin)()).toBe('foo\nbar\nbaz\n');
        });
    });
});
//# sourceMappingURL=prompts.test.js.map