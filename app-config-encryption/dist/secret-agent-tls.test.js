"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const secret_agent_tls_1 = require("./secret-agent-tls");
describe('Certificates', () => {
    it('generates a basic cert', async () => {
        const { key, cert } = await (0, secret_agent_tls_1.generateCert)();
        expect(typeof key).toBe('string');
        expect(typeof cert).toBe('string');
    });
    it('fails with an invalid expiry', async () => {
        await expect((0, secret_agent_tls_1.generateCert)(Infinity)).rejects.toThrow();
        await expect((0, secret_agent_tls_1.generateCert)(-1)).rejects.toThrow();
    });
});
//# sourceMappingURL=secret-agent-tls.test.js.map