import { Json } from '@app-config/utils';
import { PrivateKey, EncryptedSymmetricKey } from './encryption';
declare const common: import("@lcdev/ws-rpc").Builder<any, import("@lcdev/ws-rpc").FunctionVariants<never, any> & {
    Ping: import("@lcdev/ws-rpc").FunctionVariant<"Ping", void, void, any>;
} & {
    Decrypt: import("@lcdev/ws-rpc").FunctionVariant<"Decrypt", {
        text: string;
        symmetricKey: EncryptedSymmetricKey;
    }, Json, any>;
} & {
    Encrypt: import("@lcdev/ws-rpc").FunctionVariant<"Encrypt", {
        value: Json;
        symmetricKey: EncryptedSymmetricKey;
    }, string, any>;
}, import("@lcdev/ws-rpc").EventVariants<never, any>>;
export type Server = typeof common.Connection;
export type Client = typeof common.Connection;
export declare function startAgent(socketOrPortOverride?: number | string, privateKeyOverride?: PrivateKey): Promise<Server>;
export declare function connectAgent(closeTimeoutMs?: number, socketOrPortOverride?: number | string, loadEncryptedKey?: typeof loadSymmetricKey): Promise<{
    readonly close: () => Promise<void>;
    readonly isClosed: () => boolean;
    readonly ping: () => Promise<void>;
    readonly decryptValue: (text: string) => Promise<Json>;
    readonly encryptValue: (value: Json, symmetricKey: EncryptedSymmetricKey) => Promise<string>;
}>;
export declare function connectAgentLazy(closeTimeoutMs?: number, socketOrPortOverride?: number | string): ReturnType<typeof connectAgent>;
export declare function disconnectAgents(): Promise<void>;
export declare function shouldUseSecretAgent(value?: boolean): boolean;
export declare function getAgentPortOrSocket(socketOrPortOverride?: number | string): Promise<number | string>;
declare function loadSymmetricKey(revision: number): Promise<EncryptedSymmetricKey>;
export {};