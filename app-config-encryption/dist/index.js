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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
const extension_utils_1 = require("@app-config/extension-utils");
const logging_1 = require("@app-config/logging");
const encryption_1 = require("./encryption");
__exportStar(require("./encryption"), exports);
__exportStar(require("./secret-agent"), exports);
__exportStar(require("./secret-agent-tls"), exports);
/** Decrypts inline encrypted values */
function encryptedDirective(symmetricKey, shouldShowDeprecationNotice) {
    return (0, extension_utils_1.named)('encryption', (value) => {
        if (typeof value === 'string' && value.startsWith('enc:')) {
            return async (parse) => {
                if (shouldShowDeprecationNotice) {
                    logging_1.logger.warn('Detected deprecated use of @app-config/encryption parsing extension. Please install @app-config/encryption and add it to your meta file "parsingExtensions".');
                }
                const decrypted = await (0, encryption_1.decryptValue)(value, symmetricKey);
                return parse(decrypted, { fromSecrets: true, parsedFromEncryptedValue: true });
            };
        }
        return false;
    });
}
exports.default = encryptedDirective;
//# sourceMappingURL=index.js.map