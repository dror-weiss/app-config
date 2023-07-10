/// <reference types="node" />
import * as pgp from 'openpgp';
import { Json } from '@app-config/utils';
import { EncryptedSymmetricKey } from '@app-config/meta';
export type Key = pgp.Key & {
    keyName?: string;
};
export type PrivateKey = pgp.PrivateKey & {
    keyName?: string;
};
export type PublicKey = pgp.PublicKey & {
    keyName?: string;
};
export declare const keyDirs: {
    readonly keychain: string;
    readonly privateKey: string;
    readonly publicKey: string;
    readonly revocationCert: string;
};
interface UserKeys {
    privateKey: string;
    publicKey: string;
    revocationCertificate: string;
}
export declare function initializeKeysManually(options: {
    name: string;
    email: string;
    passphrase?: string;
}): Promise<UserKeys>;
export declare function initializeKeys(withPassphrase?: boolean): Promise<UserKeys>;
export declare function initializeLocalKeys(keys?: UserKeys, dirs?: typeof keyDirs): Promise<false | {
    publicKey: string;
}>;
export declare function deleteLocalKeys(dirs?: typeof keyDirs): Promise<void>;
export declare function loadKey(contents: string | Uint8Array): Promise<PrivateKey>;
export declare function loadPrivateKey(override?: string | Buffer): Promise<PrivateKey>;
export declare function loadPublicKey(override?: string | Buffer): Promise<Key>;
export declare function loadPrivateKeyLazy(): Promise<PrivateKey>;
export declare function loadPublicKeyLazy(): Promise<Key>;
export { EncryptedSymmetricKey };
export interface DecryptedSymmetricKey {
    revision: number;
    key: Uint8Array;
}
export declare function generateSymmetricKey(revision: number): Promise<DecryptedSymmetricKey>;
export declare function encryptSymmetricKey(decrypted: DecryptedSymmetricKey, teamMembers: PublicKey[]): Promise<EncryptedSymmetricKey>;
export declare function decryptSymmetricKey(encrypted: EncryptedSymmetricKey, privateKey: PrivateKey): Promise<DecryptedSymmetricKey>;
export declare function saveNewSymmetricKey(symmetricKey: DecryptedSymmetricKey, teamMembers: Key[]): Promise<void>;
export declare function loadSymmetricKeys(lazy?: boolean): Promise<EncryptedSymmetricKey[]>;
export declare function loadSymmetricKey(revision: number, privateKey: PrivateKey, lazyMeta?: boolean): Promise<DecryptedSymmetricKey>;
export declare function loadSymmetricKeyLazy(revision: number, privateKey: PrivateKey): Promise<DecryptedSymmetricKey>;
export declare function loadLatestSymmetricKey(privateKey: PrivateKey): Promise<DecryptedSymmetricKey>;
export declare function loadLatestSymmetricKeyLazy(privateKey: PrivateKey): Promise<DecryptedSymmetricKey>;
export declare function encryptValue(value: Json, symmetricKeyOverride?: DecryptedSymmetricKey): Promise<string>;
export declare function decryptValue(text: string, symmetricKeyOverride?: DecryptedSymmetricKey): Promise<Json>;
export declare function loadTeamMembers(): Promise<PublicKey[]>;
export declare function loadTeamMembersLazy(): Promise<Key[]>;
export declare function trustTeamMember(newTeamMember: Key, privateKey: PrivateKey): Promise<void>;
export declare function untrustTeamMember(email: string, privateKey: PrivateKey): Promise<void>;
export declare function latestSymmetricKeyRevision(keys: (EncryptedSymmetricKey | DecryptedSymmetricKey)[]): number;
