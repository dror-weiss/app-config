"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.latestSymmetricKeyRevision = exports.untrustTeamMember = exports.trustTeamMember = exports.loadTeamMembersLazy = exports.loadTeamMembers = exports.decryptValue = exports.encryptValue = exports.loadLatestSymmetricKeyLazy = exports.loadLatestSymmetricKey = exports.loadSymmetricKeyLazy = exports.loadSymmetricKey = exports.loadSymmetricKeys = exports.saveNewSymmetricKey = exports.decryptSymmetricKey = exports.encryptSymmetricKey = exports.generateSymmetricKey = exports.loadPublicKeyLazy = exports.loadPrivateKeyLazy = exports.loadPublicKey = exports.loadPrivateKey = exports.loadKey = exports.deleteLocalKeys = exports.initializeLocalKeys = exports.initializeKeys = exports.initializeKeysManually = exports.keyDirs = void 0;
const path_1 = require("path");
const fs = __importStar(require("fs-extra"));
const pgp = __importStar(require("openpgp"));
const util_1 = require("util");
const common_tags_1 = require("common-tags");
const core_1 = require("@app-config/core");
const logging_1 = require("@app-config/logging");
const node_1 = require("@app-config/node");
const meta_1 = require("@app-config/meta");
const settings_1 = require("@app-config/settings");
const secret_agent_1 = require("./secret-agent");
const crypto = __importStar(require("crypto"));
exports.keyDirs = {
    get keychain() {
        if (process.env.APP_CONFIG_SECRETS_KEYCHAIN_FOLDER) {
            return (0, path_1.resolve)(process.env.APP_CONFIG_SECRETS_KEYCHAIN_FOLDER);
        }
        return (0, path_1.join)((0, settings_1.settingsDirectory)(), 'keychain');
    },
    get privateKey() {
        return (0, path_1.join)(exports.keyDirs.keychain, 'private-key.asc');
    },
    get publicKey() {
        return (0, path_1.join)(exports.keyDirs.keychain, 'public-key.asc');
    },
    get revocationCert() {
        return (0, path_1.join)(exports.keyDirs.keychain, 'revocation.asc');
    },
};
async function initializeKeysManually(options) {
    const { name, email, passphrase } = options;
    if (passphrase) {
        logging_1.logger.verbose(`Initializing a key with passphrase for ${email}`);
    }
    else {
        logging_1.logger.verbose(`Initializing a key without a passphrase for ${email}`);
    }
    const { privateKey, publicKey, revocationCertificate } = await pgp.generateKey({
        curve: 'ed25519',
        userIDs: [{ name, email }],
        passphrase,
    });
    return {
        privateKey,
        publicKey,
        revocationCertificate,
    };
}
exports.initializeKeysManually = initializeKeysManually;
async function initializeKeys(withPassphrase = true) {
    if (!(0, logging_1.checkTTY)())
        throw new core_1.SecretsRequireTTYError();
    const name = await (0, node_1.promptUser)({ message: 'Name', type: 'text' });
    const email = await (0, node_1.promptUser)({ message: 'Email', type: 'text' });
    let passphrase;
    if (withPassphrase) {
        passphrase = await (0, node_1.promptUser)({ message: 'Passphrase', type: 'password' });
    }
    if (!name)
        throw new core_1.EmptyStdinOrPromptResponse('No name given');
    if (!email)
        throw new core_1.EmptyStdinOrPromptResponse('No email given');
    if (withPassphrase && !passphrase)
        throw new core_1.EmptyStdinOrPromptResponse('No passphrase given');
    return initializeKeysManually({ name, email, passphrase });
}
exports.initializeKeys = initializeKeys;
async function initializeLocalKeys(keys, dirs = exports.keyDirs) {
    if (await fs.pathExists(dirs.keychain)) {
        return false;
    }
    logging_1.logger.info('Initializing your encryption keys');
    const { privateKey, publicKey, revocationCertificate } = keys !== null && keys !== void 0 ? keys : (await initializeKeys());
    const prevUmask = process.umask(0o077);
    try {
        await fs.mkdirp(dirs.keychain);
        process.umask(0o177);
        await Promise.all([
            fs.writeFile(dirs.privateKey, privateKey),
            fs.writeFile(dirs.publicKey, publicKey),
            fs.writeFile(dirs.revocationCert, revocationCertificate),
        ]);
        logging_1.logger.info(`Wrote your encryption keys in ${dirs.keychain}`);
    }
    finally {
        process.umask(prevUmask);
    }
    return { publicKey };
}
exports.initializeLocalKeys = initializeLocalKeys;
async function deleteLocalKeys(dirs = exports.keyDirs) {
    await fs.remove(dirs.keychain);
}
exports.deleteLocalKeys = deleteLocalKeys;
async function loadKey(contents) {
    if (typeof contents === 'string') {
        return await pgp.readPrivateKey({ armoredKey: contents });
    }
    else {
        return await pgp.readPrivateKey({ binaryKey: contents });
    }
}
exports.loadKey = loadKey;
async function loadPrivateKey(override) {
    if (override === undefined) {
        if (process.env.APP_CONFIG_SECRETS_KEY) {
            // eslint-disable-next-line no-param-reassign
            override = process.env.APP_CONFIG_SECRETS_KEY;
        }
        else if (process.env.APP_CONFIG_SECRETS_KEY_FILE) {
            // eslint-disable-next-line no-param-reassign
            override = (await fs.readFile(process.env.APP_CONFIG_SECRETS_KEY_FILE)).toString();
        }
    }
    let key;
    if (override) {
        key = await loadKey(override);
    }
    else {
        if (process.env.CI) {
            logging_1.logger.info('Warning! Trying to load encryption keys from home folder in a CI environment');
        }
        key = await loadKey(await fs.readFile(exports.keyDirs.privateKey));
    }
    if (!key.isPrivate()) {
        throw new core_1.InvalidEncryptionKey('Tried to load a public key as a private key');
    }
    if (!key.isDecrypted()) {
        if (!(0, logging_1.checkTTY)())
            throw new core_1.SecretsRequireTTYError();
        await (0, node_1.promptUserWithRetry)({ message: 'Your Passphrase', type: 'password' }, async (passphrase) => {
            return pgp.decryptKey({
                privateKey: key,
                passphrase
            }).then(() => true, (error) => error);
        });
    }
    return key;
}
exports.loadPrivateKey = loadPrivateKey;
async function loadPublicKey(override) {
    if (override === undefined) {
        if (process.env.APP_CONFIG_SECRETS_PUBLIC_KEY) {
            // eslint-disable-next-line no-param-reassign
            override = process.env.APP_CONFIG_SECRETS_PUBLIC_KEY;
        }
        else if (process.env.APP_CONFIG_SECRETS_PUBLIC_KEY_FILE) {
            // eslint-disable-next-line no-param-reassign
            override = (await fs.readFile(process.env.APP_CONFIG_SECRETS_PUBLIC_KEY_FILE)).toString();
        }
    }
    let key;
    if (override) {
        key = await loadKey(override);
    }
    else {
        if (process.env.CI) {
            logging_1.logger.warn('Warning! Trying to load encryption keys from home folder in a CI environment');
        }
        key = await loadKey(await fs.readFile(exports.keyDirs.publicKey));
    }
    if (key.isPrivate())
        throw new core_1.InvalidEncryptionKey('Tried to load a private key as a public key');
    return key;
}
exports.loadPublicKey = loadPublicKey;
let loadedPrivateKey;
async function loadPrivateKeyLazy() {
    if (!loadedPrivateKey) {
        logging_1.logger.verbose('Loading local private key');
        if ((0, logging_1.checkTTY)()) {
            // help the end user, if they haven't initialized their local keys yet
            loadedPrivateKey = initializeLocalKeys().then(() => loadPrivateKey());
        }
        else {
            loadedPrivateKey = loadPrivateKey();
        }
    }
    return loadedPrivateKey;
}
exports.loadPrivateKeyLazy = loadPrivateKeyLazy;
let loadedPublicKey;
async function loadPublicKeyLazy() {
    if (!loadedPublicKey) {
        logging_1.logger.verbose('Loading local public key');
        if ((0, logging_1.checkTTY)()) {
            // help the end user, if they haven't initialized their local keys yet
            loadedPublicKey = initializeLocalKeys().then(() => loadPublicKey());
        }
        else {
            loadedPublicKey = loadPublicKey();
        }
    }
    return loadedPublicKey;
}
exports.loadPublicKeyLazy = loadPublicKeyLazy;
const getNodeCrypto = function () {
    return require('crypto');
};
const nodeCrypto = getNodeCrypto();
/**
 * Retrieve secure random byte array of the specified length
 * @param {Integer} length - Length in bytes to generate
 * @returns {Uint8Array} Random byte array.
 */
function getRandomBytes(length) {
    const buf = new Uint8Array(length);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(buf);
    }
    else if (nodeCrypto) {
        const bytes = nodeCrypto.randomBytes(buf.length);
        buf.set(bytes);
    }
    else {
        throw new Error('No secure random number generator available.');
    }
    return buf;
}
async function generateSymmetricKey(revision) {
    // eslint-disable-next-line @typescript-eslint/await-thenable
    const rawPassword = await getRandomBytes(2048);
    const passwordWithRevision = encodeRevisionInPassword(rawPassword, revision);
    return { revision, key: passwordWithRevision };
}
exports.generateSymmetricKey = generateSymmetricKey;
async function encryptSymmetricKey(decrypted, teamMembers) {
    if (teamMembers.length === 0) {
        throw new core_1.AppConfigError('Cannot create a symmetric key with no teamMembers');
    }
    const key = await pgp.encrypt({
        message: await pgp.createMessage({ binary: decrypted.key }),
        encryptionKeys: [...teamMembers],
    });
    // @ts-ignore
    return { revision: decrypted.revision, key };
}
exports.encryptSymmetricKey = encryptSymmetricKey;
async function decryptSymmetricKey(encrypted, privateKey) {
    const decrypted = await pgp.decrypt({
        // @ts-ignore
        message: await pgp.createMessage({ binary: encrypted.key }),
        decryptionKeys: [privateKey],
    });
    const { data } = decrypted;
    verifyEncodedRevision(data, encrypted.revision);
    return { revision: encrypted.revision, key: data };
}
exports.decryptSymmetricKey = decryptSymmetricKey;
async function saveNewSymmetricKey(symmetricKey, teamMembers) {
    const encrypted = await encryptSymmetricKey(symmetricKey, teamMembers);
    await saveNewMetaFile((_a) => {
        var { encryptionKeys = [] } = _a, meta = __rest(_a, ["encryptionKeys"]);
        return (Object.assign(Object.assign({}, meta), { encryptionKeys: [...encryptionKeys, encrypted] }));
    });
}
exports.saveNewSymmetricKey = saveNewSymmetricKey;
async function loadSymmetricKeys(lazy = true) {
    // flag is here mostly for testing
    const loadMeta = lazy ? meta_1.loadMetaConfigLazy : meta_1.loadMetaConfig;
    const { value: { encryptionKeys = [] }, } = await loadMeta();
    return encryptionKeys;
}
exports.loadSymmetricKeys = loadSymmetricKeys;
async function loadSymmetricKey(revision, privateKey, lazyMeta = true) {
    const symmetricKeys = await loadSymmetricKeys(lazyMeta);
    const symmetricKey = symmetricKeys.find((k) => k.revision === revision);
    if (!symmetricKey)
        throw new core_1.InvalidEncryptionKey(`Could not find symmetric key ${revision}`);
    logging_1.logger.verbose(`Loading symmetric key r${symmetricKey.revision}`);
    return decryptSymmetricKey(symmetricKey, privateKey);
}
exports.loadSymmetricKey = loadSymmetricKey;
const symmetricKeys = new Map();
async function loadSymmetricKeyLazy(revision, privateKey) {
    if (!symmetricKeys.has(revision)) {
        symmetricKeys.set(revision, loadSymmetricKey(revision, privateKey, true));
    }
    return symmetricKeys.get(revision);
}
exports.loadSymmetricKeyLazy = loadSymmetricKeyLazy;
async function loadLatestSymmetricKey(privateKey) {
    const allKeys = await loadSymmetricKeys(false);
    return loadSymmetricKey(latestSymmetricKeyRevision(allKeys), privateKey, false);
}
exports.loadLatestSymmetricKey = loadLatestSymmetricKey;
async function loadLatestSymmetricKeyLazy(privateKey) {
    const allKeys = await loadSymmetricKeys();
    return loadSymmetricKeyLazy(latestSymmetricKeyRevision(allKeys), privateKey);
}
exports.loadLatestSymmetricKeyLazy = loadLatestSymmetricKeyLazy;
async function encryptValue(value, symmetricKeyOverride) {
    if (!symmetricKeyOverride && (0, secret_agent_1.shouldUseSecretAgent)()) {
        const client = await retrieveSecretAgent();
        if (client) {
            const allKeys = await loadSymmetricKeys();
            const latestRevision = latestSymmetricKeyRevision(allKeys);
            const symmetricKey = allKeys.find((k) => k.revision === latestRevision);
            return client.encryptValue(value, symmetricKey);
        }
    }
    let symmetricKey;
    if (symmetricKeyOverride) {
        symmetricKey = symmetricKeyOverride;
    }
    else {
        symmetricKey = await loadLatestSymmetricKeyLazy(await loadPrivateKeyLazy());
    }
    // all encrypted data is JSON encoded
    const text = JSON.stringify(value);
    const data = await pgp.encrypt({
        message: await pgp.createMessage({ text }),
        passwords: [symmetricKey.key], // openpgp does accept non-string passwords, ts is wrong
    });
    // we take out the base64 encoded portion, so that secrets are nice and short, easy to copy-paste
    const base64Regex = /\r\n\r\n((?:\S+\r\n)+)-----END PGP MESSAGE-----/g;
    const extracted = base64Regex.exec(data.toString());
    if (!extracted) {
        throw new core_1.EncryptionEncoding('Invalid message was formed in encryption');
    }
    const base64 = extracted[1].split('\r\n').join('');
    return `enc:${symmetricKey.revision}:${base64}`;
}
exports.encryptValue = encryptValue;
async function decryptValue(text, symmetricKeyOverride) {
    if (!symmetricKeyOverride && (0, secret_agent_1.shouldUseSecretAgent)()) {
        const client = await retrieveSecretAgent();
        if (client) {
            return client.decryptValue(text);
        }
    }
    const [, revision, base64] = text.split(':');
    let symmetricKey;
    if (symmetricKeyOverride) {
        symmetricKey = symmetricKeyOverride;
    }
    else {
        const revisionNumber = parseFloat(revision);
        if (Number.isNaN(revisionNumber)) {
            throw new core_1.AppConfigError(`Encrypted value was invalid, revision was not a number (${revision})`);
        }
        symmetricKey = await loadSymmetricKeyLazy(revisionNumber, await loadPrivateKeyLazy());
    }
    const armored = `-----BEGIN PGP MESSAGE-----\nVersion: OpenPGP.js VERSION\n\n${base64}\n-----END PGP PUBLIC KEY BLOCK-----`;
    const decrypted = await pgp.decrypt({
        format: 'utf8',
        message: await pgp.createMessage({ text: armored }),
        passwords: [symmetricKey.key], // openpgp does accept non-string passwords, ts is wrong
    });
    const { data } = decrypted;
    if (!data || data.length === 0) {
        throw new core_1.EncryptionEncoding('Data in decryption returned back a zero-length string');
    }
    // all encrypted data is JSON encoded
    return JSON.parse(data);
}
exports.decryptValue = decryptValue;
async function loadTeamMembers() {
    const { value: { teamMembers = [] }, } = await (0, meta_1.loadMetaConfig)();
    return Promise.all(teamMembers.map(({ keyName, publicKey }) => loadKey(publicKey).then((key) => Object.assign(key, { keyName }))));
}
exports.loadTeamMembers = loadTeamMembers;
let loadedTeamMembers;
async function loadTeamMembersLazy() {
    if (!loadedTeamMembers) {
        loadedTeamMembers = loadTeamMembers();
    }
    return loadedTeamMembers;
}
exports.loadTeamMembersLazy = loadTeamMembersLazy;
async function trustTeamMember(newTeamMember, privateKey) {
    const teamMembers = await loadTeamMembers();
    if (newTeamMember.isPrivate()) {
        throw new core_1.InvalidEncryptionKey('A private key was passed in as a team member. Only public keys should be in team members.');
    }
    const newUserId = newTeamMember.getUserIDs().join('');
    const foundDuplicate = teamMembers.find((k) => k.getUserIDs().join('') === newUserId);
    if (foundDuplicate) {
        const userIds = foundDuplicate.getUserIDs().join(', ');
        logging_1.logger.warn(`The team member '${userIds}' was already trusted. Adding anyways.`);
    }
    const newTeamMembers = teamMembers.concat(newTeamMember);
    const newEncryptionKeys = await reencryptSymmetricKeys(await loadSymmetricKeys(), newTeamMembers, privateKey);
    await saveNewMetaFile((meta) => (Object.assign(Object.assign({}, meta), { teamMembers: newTeamMembers.map((key) => {
            var _a;
            return ({
                userId: key.getUserIDs()[0],
                keyName: (_a = key.keyName) !== null && _a !== void 0 ? _a : null,
                publicKey: key.armor(),
            });
        }), encryptionKeys: newEncryptionKeys })));
}
exports.trustTeamMember = trustTeamMember;
async function untrustTeamMember(email, privateKey) {
    const teamMembers = await loadTeamMembers();
    const removalCandidates = new Set();
    for (const teamMember of teamMembers) {
        if (teamMember.getUserIDs().some((u) => u.includes(`<${email}>`))) {
            removalCandidates.add(teamMember);
        }
    }
    let removeTeamMembers;
    if (removalCandidates.size > 1) {
        removeTeamMembers = await (0, node_1.promptUser)({
            type: 'multiselect',
            message: 'Which team members should be untrusted?',
            hint: '- Space to select. Enter to submit.',
            instructions: false,
            choices: Array.from(removalCandidates).map((teamMember) => ({
                title: teamMember.keyName ? `${email} (${teamMember.keyName})` : email,
                value: teamMember,
            })),
        });
    }
    else {
        removeTeamMembers = Array.from(removalCandidates);
    }
    for (const teamMember of removeTeamMembers) {
        logging_1.logger.warn(`Removing trust from ${teamMember.getUserIDs().join(', ')}`);
    }
    const newTeamMembers = teamMembers.filter((teamMember) => !removeTeamMembers.includes(teamMember));
    if (newTeamMembers.length === teamMembers.length) {
        throw new core_1.AppConfigError(`There were no team members with the email ${email}`);
    }
    if (newTeamMembers.length === 0) {
        throw new core_1.AppConfigError('You cannot remove the last team member, since there would be no one to trust');
    }
    // re-encrypt symmetric keys without the team member
    // this isn't actually secure on its own, which is why we create a new one
    // we do this solely to make it harder to go back in time and get old secrets
    // of course, nothing stops users from having previously copy-pasted secrets, so they should always be rotated when untrusting old users
    // reason being, they had previous access to the actual private symmetric key
    const newEncryptionKeys = await reencryptSymmetricKeys(await loadSymmetricKeys(), newTeamMembers, privateKey);
    const newLatestEncryptionKey = await encryptSymmetricKey(await generateSymmetricKey(latestSymmetricKeyRevision(newEncryptionKeys) + 1), newTeamMembers);
    newEncryptionKeys.push(newLatestEncryptionKey);
    await saveNewMetaFile((meta) => (Object.assign(Object.assign({}, meta), { teamMembers: newTeamMembers.map((key) => {
            var _a;
            return ({
                userId: key.getUserIDs()[0],
                keyName: (_a = key.keyName) !== null && _a !== void 0 ? _a : null,
                publicKey: key.armor(),
            });
        }), encryptionKeys: newEncryptionKeys })));
}
exports.untrustTeamMember = untrustTeamMember;
function latestSymmetricKeyRevision(keys) {
    keys.sort((a, b) => a.revision - b.revision);
    if (keys.length === 0)
        throw new core_1.InvalidEncryptionKey('No symmetric keys were found');
    return keys[keys.length - 1].revision;
}
exports.latestSymmetricKeyRevision = latestSymmetricKeyRevision;
async function reencryptSymmetricKeys(previousSymmetricKeys, newTeamMembers, privateKey) {
    const newEncryptionKeys = [];
    if (previousSymmetricKeys.length === 0) {
        const initialKey = await generateSymmetricKey(1);
        const encrypted = await encryptSymmetricKey(initialKey, newTeamMembers);
        newEncryptionKeys.push(encrypted);
    }
    else {
        for (const symmetricKey of previousSymmetricKeys) {
            // re-encrypt every key using the new team members list
            const decrypted = await decryptSymmetricKey(symmetricKey, privateKey);
            const encrypted = await encryptSymmetricKey(decrypted, newTeamMembers);
            newEncryptionKeys.push(encrypted);
        }
    }
    return newEncryptionKeys;
}
async function retrieveSecretAgent() {
    let client;
    try {
        client = await (0, secret_agent_1.connectAgentLazy)();
    }
    catch (err) {
        if (err && typeof err === 'object' && 'error' in err) {
            const { error } = err;
            if (error.errno === 'ECONNREFUSED') {
                logging_1.logger.warn('Secret agent is not running');
            }
            logging_1.logger.verbose(`Secret agent connect error: ${(0, util_1.inspect)(error)}`);
        }
        else {
            logging_1.logger.error(`Secret agent connect error: ${(0, util_1.inspect)(err)}`);
        }
    }
    return client;
}
async function saveNewMetaFile(mutate) {
    const { value: oldMeta, filePath, fileType } = await (0, meta_1.loadMetaConfig)();
    const writeMeta = mutate(oldMeta);
    const writeFilePath = filePath !== null && filePath !== void 0 ? filePath : '.app-config.meta.yml';
    const writeFileType = fileType !== null && fileType !== void 0 ? fileType : core_1.FileType.YAML;
    logging_1.logger.info(`Writing ${writeFilePath} file with new encryption properties`);
    await fs.writeFile(writeFilePath, (0, core_1.stringify)(writeMeta, writeFileType));
}
function decodeTypedArray(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}
function stringAsTypedArray(str) {
    // 2 bytes for each char
    const buf = new ArrayBuffer(str.length * 2);
    const bufView = new Uint16Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i += 1) {
        bufView[i] = str.charCodeAt(i);
    }
    return bufView;
}
function encodeRevisionInPassword(password, revision) {
    const revisionBytes = stringAsTypedArray(revision.toString());
    const passwordWithRevision = new Uint8Array(password.length + revisionBytes.length + 1);
    // first byte is the revision length, next N bytes is the revision as a string
    passwordWithRevision.set([revisionBytes.length], 0);
    passwordWithRevision.set(revisionBytes, 1);
    passwordWithRevision.set(password, revisionBytes.length + 1);
    return passwordWithRevision;
}
function verifyEncodedRevision(password, expectedRevision) {
    const revisionBytesLength = password[0];
    const revisionBytes = password.slice(1, 1 + revisionBytesLength);
    const revision = decodeTypedArray(revisionBytes);
    if (parseFloat(revision) !== expectedRevision) {
        throw new core_1.EncryptionEncoding((0, common_tags_1.oneLine) `
      We detected tampering in the encryption key, revision ${expectedRevision}!
      This error occurs when the revision in the 'encryptionKeys' does not match the one that was embedded into the key.
      It might not be safe to continue using this encryption key.
      If you know that it is safe, change the revision in the app-config meta file to ${revision}.
    `);
    }
}
//# sourceMappingURL=encryption.js.map