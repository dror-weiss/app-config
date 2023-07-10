"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const utils_1 = require("@app-config/utils");
const core_1 = require("@app-config/core");
const meta_1 = require("@app-config/meta");
const test_utils_1 = require("@app-config/test-utils");
const encryption_1 = require("./encryption");
describe('User Keys', () => {
    it('initialize keys without passphrase', async () => {
        const { privateKey, publicKey } = await (0, encryption_1.initializeKeysManually)({
            name: 'Tester',
            email: 'test@example.com',
        });
        await (0, encryption_1.loadPublicKey)(publicKey);
        await (0, encryption_1.loadPrivateKey)(privateKey);
    });
    it('initialize keys with passphrase', async () => {
        const { privateKey, publicKey } = await (0, encryption_1.initializeKeysManually)({
            name: 'Tester',
            email: 'test@example.com',
            passphrase: 'Secret!',
        });
        await (0, encryption_1.loadPublicKey)(publicKey);
        await expect((0, encryption_1.loadPrivateKey)(privateKey)).rejects.toBeInstanceOf(core_1.SecretsRequireTTYError);
    });
    it('initializes keys with a passphrase from stdin', async () => {
        await (0, test_utils_1.mockedStdin)(async (send) => {
            send('My Name')
                .then(() => send('me@example.com'))
                .then(() => send('$ecure!'))
                .catch(() => { });
            const { privateKey, publicKey } = await (0, encryption_1.initializeKeys)();
            await (0, encryption_1.loadPublicKey)(publicKey);
            send('$ecure!').catch(() => { });
            await (0, encryption_1.loadPrivateKey)(privateKey);
        });
    });
    it('initializes keys into a directory', async () => {
        await (0, test_utils_1.withTempFiles)({}, async (inDir) => {
            const keys = {
                privateKey: 'privateKeyArmored',
                publicKey: 'publicKeyArmored',
                revocationCertificate: 'revocationCertificate',
            };
            const dirs = {
                keychain: inDir('keychain'),
                privateKey: inDir('keychain/private-key.asc'),
                publicKey: inDir('keychain/public-key.asc'),
                revocationCert: inDir('keychain/revocation.asc'),
            };
            const returned = await (0, encryption_1.initializeLocalKeys)(keys, dirs);
            expect(returned).toEqual({ publicKeyArmored: 'publicKeyArmored' });
            expect((await (0, fs_extra_1.readFile)(inDir('keychain/private-key.asc'))).toString()).toEqual('privateKeyArmored');
            expect((await (0, fs_extra_1.readFile)(inDir('keychain/public-key.asc'))).toString()).toEqual('publicKeyArmored');
            // eslint-disable-next-line no-bitwise
            const modeToOctal = (mode) => (mode & 0o777).toString(8);
            if (!utils_1.isWindows) {
                expect(modeToOctal((await (0, fs_extra_1.stat)(inDir('keychain/private-key.asc'))).mode)).toBe('600');
            }
            else {
                expect(modeToOctal((await (0, fs_extra_1.stat)(inDir('keychain/private-key.asc'))).mode)).toBe('666');
            }
            await (0, encryption_1.deleteLocalKeys)(dirs);
        });
    });
});
const createKey = async () => {
    const { privateKey: privateKeyArmored } = await (0, encryption_1.initializeKeysManually)({
        name: 'Tester',
        email: 'test@example.com',
    });
    return (0, encryption_1.loadPrivateKey)(privateKeyArmored);
};
describe('Symmetric Keys', () => {
    it('generates a plain symmetric key', async () => {
        const symmetricKey = await (0, encryption_1.generateSymmetricKey)(1);
        expect(symmetricKey.revision).toBe(1);
        expect(symmetricKey.key).toBeInstanceOf(Uint8Array);
        expect(symmetricKey.key.length).toBeGreaterThan(2048);
    });
    it('encrypts and decrypts a symmetric key', async () => {
        const privateKey = await createKey();
        const symmetricKey = await (0, encryption_1.generateSymmetricKey)(1);
        const encryptedKey = await (0, encryption_1.encryptSymmetricKey)(symmetricKey, [privateKey]);
        expect(encryptedKey.revision).toBe(1);
        expect(typeof encryptedKey.key).toBe('string');
        expect(encryptedKey.key.length).toBeGreaterThan(0);
        const decryptedKey = await (0, encryption_1.decryptSymmetricKey)(encryptedKey, privateKey);
        expect(decryptedKey.revision).toBe(1);
        expect(decryptedKey.key).toEqual(symmetricKey.key);
    });
    it('cannot decrypt a symmetric key that was created by someone else', async () => {
        const privateKey = await createKey();
        const someoneElsesKey = await createKey();
        const symmetricKey = await (0, encryption_1.generateSymmetricKey)(1);
        const encryptedKey = await (0, encryption_1.encryptSymmetricKey)(symmetricKey, [someoneElsesKey]);
        await expect((0, encryption_1.decryptSymmetricKey)(encryptedKey, privateKey)).rejects.toThrow();
    });
    it('can decrypt a symmetric key from multiple private keys', async () => {
        const privateKey = await createKey();
        const someoneElsesKey = await createKey();
        const symmetricKey = await (0, encryption_1.generateSymmetricKey)(1);
        const encryptedKey = await (0, encryption_1.encryptSymmetricKey)(symmetricKey, [privateKey, someoneElsesKey]);
        await expect((0, encryption_1.decryptSymmetricKey)(encryptedKey, privateKey)).resolves.toEqual(symmetricKey);
        await expect((0, encryption_1.decryptSymmetricKey)(encryptedKey, someoneElsesKey)).resolves.toEqual(symmetricKey);
    });
    it('can re-encrypt a key that was previously only for one person', async () => {
        const privateKey = await createKey();
        const someoneElsesKey = await createKey();
        const symmetricKey = await (0, encryption_1.generateSymmetricKey)(1);
        const encryptedKey = await (0, encryption_1.encryptSymmetricKey)(symmetricKey, [privateKey]);
        const decryptedKey = await (0, encryption_1.decryptSymmetricKey)(encryptedKey, privateKey);
        const encryptedKey2 = await (0, encryption_1.encryptSymmetricKey)(decryptedKey, [privateKey, someoneElsesKey]);
        const decryptedKey2 = await (0, encryption_1.decryptSymmetricKey)(encryptedKey2, someoneElsesKey);
        expect(decryptedKey).toEqual(symmetricKey);
        expect(decryptedKey2).toEqual(symmetricKey);
    });
    it('validates encoded revision number in keys', async () => {
        const privateKey = await createKey();
        const symmetricKey = await (0, encryption_1.generateSymmetricKey)(1);
        const encryptedKey = await (0, encryption_1.encryptSymmetricKey)(symmetricKey, [privateKey]);
        // really go out of our way to mess with the key - this usually results in integrity check failures either way
        const ind = encryptedKey.key.indexOf('\r\n\r\n') + 4;
        const rev = String.fromCharCode(encryptedKey.key.charCodeAt(ind) + 1);
        encryptedKey.key = encryptedKey.key.slice(0, ind) + rev + encryptedKey.key.slice(ind + 1);
        await expect((0, encryption_1.decryptSymmetricKey)(encryptedKey, privateKey)).rejects.toThrow();
    });
});
describe('Value Encryption', () => {
    it('encrypts and decrypts JSON-compatible values', async () => {
        const values = ['hello world', 42.42, null, true, { message: 'hello world', nested: {} }];
        for (const value of values) {
            const symmetricKey = await (0, encryption_1.generateSymmetricKey)(1);
            const encrypted = await (0, encryption_1.encryptValue)(value, symmetricKey);
            const decrypted = await (0, encryption_1.decryptValue)(encrypted, symmetricKey);
            expect(typeof encrypted).toEqual('string');
            expect(encrypted).toMatch(/^enc:1:/);
            expect(decrypted).toEqual(value);
        }
    });
    it('cannot decrypt a value with the wrong key', async () => {
        const value = 'hello world';
        const symmetricKey = await (0, encryption_1.generateSymmetricKey)(1);
        const wrongKey = await (0, encryption_1.generateSymmetricKey)(1);
        const encrypted = await (0, encryption_1.encryptValue)(value, symmetricKey);
        await expect((0, encryption_1.decryptValue)(encrypted, wrongKey)).rejects.toThrow();
    });
});
describe('E2E Encrypted Repo', () => {
    it('sets up, trusts and untrusts users correctly', () => {
        const cwd = process.cwd();
        return (0, test_utils_1.withTempFiles)({}, async (inDir) => {
            process.chdir(inDir('.'));
            process.env.APP_CONFIG_SECRETS_KEYCHAIN_FOLDER = inDir('keychain');
            const keys = await (0, encryption_1.initializeKeysManually)({
                name: 'Tester',
                email: 'test@example.com',
            });
            const dirs = {
                keychain: inDir('keychain'),
                privateKey: inDir('keychain/private-key.asc'),
                publicKey: inDir('keychain/public-key.asc'),
                revocationCert: inDir('keychain/revocation.asc'),
            };
            expect(await (0, encryption_1.initializeLocalKeys)(keys, dirs)).toEqual({
                publicKeyArmored: keys.publicKey,
            });
            const publicKey = await (0, encryption_1.loadPublicKey)();
            const privateKey = await (0, encryption_1.loadPrivateKey)();
            // this is what init-repo does
            await (0, encryption_1.trustTeamMember)(publicKey, privateKey);
            // at this point, we should have ourselves trusted, and 1 symmetric key
            const { value: meta } = await (0, meta_1.loadMetaConfig)();
            expect(meta.teamMembers).toHaveLength(1);
            expect(meta.encryptionKeys).toHaveLength(1);
            const encryptionKey = await (0, encryption_1.loadLatestSymmetricKey)(privateKey);
            const encrypted = await (0, encryption_1.encryptValue)('a secret value', encryptionKey);
            await expect((0, encryption_1.decryptValue)(encrypted, encryptionKey)).resolves.toBe('a secret value');
            const teammateKeys = await (0, encryption_1.initializeKeysManually)({
                name: 'A Teammate',
                email: 'teammate@example.com',
            });
            const teammatePublicKey = await (0, encryption_1.loadPublicKey)(teammateKeys.publicKey);
            const teammatePrivateKey = await (0, encryption_1.loadPrivateKey)(teammateKeys.privateKey);
            await (0, encryption_1.trustTeamMember)(teammatePublicKey, privateKey);
            // at this point, we should have 2 team members, but still 1 symmetric key
            const { value: metaAfterTrustingTeammate } = await (0, meta_1.loadMetaConfig)();
            expect(metaAfterTrustingTeammate.teamMembers).toHaveLength(2);
            expect(metaAfterTrustingTeammate.encryptionKeys).toHaveLength(1);
            // ensures that the teammate can now encrypt/decrypt values
            const encryptedByTeammate = await (0, encryption_1.encryptValue)('a secret value', await (0, encryption_1.loadLatestSymmetricKey)(teammatePrivateKey));
            await expect((0, encryption_1.decryptValue)(encryptedByTeammate, await (0, encryption_1.loadLatestSymmetricKey)(teammatePrivateKey))).resolves.toBe('a secret value');
            // ensures that we can still encrypt/decrypt values
            const encryptedByUs = await (0, encryption_1.encryptValue)('a secret value', await (0, encryption_1.loadLatestSymmetricKey)(privateKey));
            await expect((0, encryption_1.decryptValue)(encryptedByUs, await (0, encryption_1.loadLatestSymmetricKey)(privateKey))).resolves.toBe('a secret value');
            await (0, encryption_1.untrustTeamMember)('teammate@example.com', privateKey);
            // at this point, we should have 1 team members, and a newly generated symmetric key
            const { value: metaAfterUntrustingTeammate } = await (0, meta_1.loadMetaConfig)();
            expect(metaAfterUntrustingTeammate.teamMembers).toHaveLength(1);
            expect(metaAfterUntrustingTeammate.encryptionKeys).toHaveLength(2);
            // ensures that we can still encrypt/decrypt values
            const newlyEncryptedByUs = await (0, encryption_1.encryptValue)('a secret value', await (0, encryption_1.loadLatestSymmetricKey)(privateKey));
            await expect((0, encryption_1.decryptValue)(newlyEncryptedByUs, await (0, encryption_1.loadLatestSymmetricKey)(privateKey))).resolves.toBe('a secret value');
            // now, the teammate should have no access
            await expect((0, encryption_1.loadLatestSymmetricKey)(teammatePrivateKey)).rejects.toThrow();
            // just for test coverage, create a new symmetric key
            const latestSymmetricKey = await (0, encryption_1.loadLatestSymmetricKey)(privateKey);
            await (0, encryption_1.saveNewSymmetricKey)(await (0, encryption_1.generateSymmetricKey)(latestSymmetricKey.revision + 1), await (0, encryption_1.loadTeamMembers)());
            const { value: metaAfterNewSymmetricKey } = await (0, meta_1.loadMetaConfig)();
            expect(metaAfterNewSymmetricKey.teamMembers).toHaveLength(1);
            expect(metaAfterNewSymmetricKey.encryptionKeys).toHaveLength(3);
            // get out of the directory, Windows doesn't like unlink while cwd
            process.chdir(cwd);
        });
    });
});
//# sourceMappingURL=encryption.test.js.map