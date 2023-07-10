"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const get_port_1 = __importDefault(require("get-port"));
const path_1 = require("path");
const utils_1 = require("@app-config/utils");
const settings_1 = require("@app-config/settings");
const test_utils_1 = require("@app-config/test-utils");
const secret_agent_1 = require("./secret-agent");
const secret_agent_tls_1 = require("./secret-agent-tls");
const encryption_1 = require("./encryption");
jest.setTimeout(30000);
describe('Decryption', () => {
    it('decrypts and encrypts values', async () => {
        const { privateKey: privateKeyArmored } = await (0, encryption_1.initializeKeysManually)({
            name: 'Test',
            email: 'test@example.com',
        });
        const privateKey = await (0, encryption_1.loadPrivateKey)(privateKeyArmored);
        const symmetricKey = await (0, encryption_1.generateSymmetricKey)(1);
        const encryptedSymmetricKey = await (0, encryption_1.encryptSymmetricKey)(symmetricKey, [privateKey]);
        const port = await (0, get_port_1.default)();
        const server = await (0, secret_agent_1.startAgent)(port, privateKey);
        const client = await (0, secret_agent_1.connectAgent)(Infinity, port, async () => encryptedSymmetricKey);
        try {
            await client.ping();
            const values = [
                'text',
                88.88,
                true,
                null,
                { value: 42 },
                { nested: { value: true } },
                [1, 2, 3],
                [{}, { b: true }, { c: true }],
            ];
            await Promise.all(values.map(async (value) => {
                const [encryptedLocally, encryptedRemotely] = await Promise.all([
                    (0, encryption_1.encryptValue)(value, symmetricKey),
                    client.encryptValue(value, encryptedSymmetricKey),
                ]);
                const [receivedLocal, receivedRemote] = await Promise.all([
                    client.decryptValue(encryptedLocally),
                    client.decryptValue(encryptedRemotely),
                ]);
                expect(receivedLocal).toEqual(value);
                expect(receivedRemote).toEqual(value);
            }));
        }
        finally {
            await client.close();
            await server.close();
        }
        expect(client.isClosed()).toBe(true);
    });
});
describe('Unix Sockets', () => {
    it('connects using unix socket', async () => {
        if (utils_1.isWindows)
            return;
        const { privateKey: privateKeyArmored } = await (0, encryption_1.initializeKeysManually)({
            name: 'Test',
            email: 'test@example.com',
        });
        const privateKey = await (0, encryption_1.loadPrivateKey)(privateKeyArmored);
        const symmetricKey = await (0, encryption_1.generateSymmetricKey)(1);
        const encryptedSymmetricKey = await (0, encryption_1.encryptSymmetricKey)(symmetricKey, [privateKey]);
        const socket = (0, path_1.resolve)('./temporary-socket-file');
        const server = await (0, secret_agent_1.startAgent)(socket, privateKey);
        const client = await (0, secret_agent_1.connectAgent)(Infinity, socket, async () => encryptedSymmetricKey);
        try {
            await client.ping();
            const encrypted = await client.encryptValue({ foo: 'bar' }, encryptedSymmetricKey);
            const decrypted = await client.decryptValue(encrypted);
            expect(typeof encrypted).toBe('string');
            expect(decrypted).toEqual({ foo: 'bar' });
        }
        finally {
            await client.close();
            await server.close();
        }
        expect(client.isClosed()).toBe(true);
    });
});
describe('shouldUseSecretAgent', () => {
    it('sets and retrieves value', () => {
        (0, secret_agent_1.shouldUseSecretAgent)(true);
        expect((0, secret_agent_1.shouldUseSecretAgent)()).toBe(true);
        (0, secret_agent_1.shouldUseSecretAgent)(false);
        expect((0, secret_agent_1.shouldUseSecretAgent)()).toBe(false);
    });
});
describe('getAgentPortOrSocket', () => {
    it('loads agent port from settings', () => (0, test_utils_1.withTempFiles)({}, async (inDir) => {
        process.env.APP_CONFIG_SETTINGS_FOLDER = inDir('settings');
        const { cert, key, expiry } = await (0, secret_agent_tls_1.loadOrCreateCert)();
        await (0, settings_1.saveSettings)({ secretAgent: { port: 1111, cert, key, expiry } });
        await expect((0, secret_agent_1.getAgentPortOrSocket)()).resolves.toBe(1111);
        await (0, settings_1.saveSettings)({ secretAgent: { socket: './foo', cert, key, expiry } });
        await expect((0, secret_agent_1.getAgentPortOrSocket)()).resolves.toBe('./foo');
    }));
});
//# sourceMappingURL=secret-agent.test.js.map