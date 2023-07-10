"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const fetch_1 = require("@lcdev/fetch");
const extension_utils_1 = require("@app-config/extension-utils");
(0, fetch_1.setGlobalFetch)(cross_fetch_1.default);
function vaultParsingExtension(options = {}) {
    var _a, _b, _c, _d;
    const address = (_b = (_a = options.address) !== null && _a !== void 0 ? _a : process.env.VAULT_ADDR) !== null && _b !== void 0 ? _b : 'http://127.0.0.1:8200';
    const token = (_c = options.token) !== null && _c !== void 0 ? _c : process.env.VAULT_TOKEN;
    const namespace = (_d = options.namespace) !== null && _d !== void 0 ? _d : process.env.VAULT_NAMESPACE;
    const vaultApi = (0, fetch_1.api)(address).withTransform((builder) => {
        let call = builder;
        if (token) {
            call = call.withHeader('X-Vault-Token', token);
        }
        if (namespace) {
            call = call.withHeader('X-Vault-Namespace', namespace);
        }
        return call.expectStatus(200);
    });
    return (0, extension_utils_1.named)('$vault', (0, extension_utils_1.forKey)('$vault', (0, extension_utils_1.validateOptions)((SchemaBuilder) => SchemaBuilder.emptySchema().addString('secret').addString('select'), (value) => async (parse) => {
        const { secret, select } = value;
        const path = secret.includes('/') ? secret : `secret/data/${secret}`;
        const { data: { data }, } = await vaultApi
            .get((0, fetch_1.buildPath)('v1', path))
            .withQuery({ version: '2' })
            .json();
        const namedValue = data[select];
        if (typeof namedValue === 'undefined') {
            throw new Error(`The named value "${select}" was not found in the KV secret "${secret}"`);
        }
        return parse(namedValue, { shouldFlatten: true });
    })));
}
exports.default = vaultParsingExtension;
//# sourceMappingURL=index.js.map