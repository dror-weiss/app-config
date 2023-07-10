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
Object.defineProperty(exports, "__esModule", { value: true });
const extension_utils_1 = require("@app-config/extension-utils");
const node_1 = require("@app-config/node");
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
function jsModuleDirective() {
    return (0, extension_utils_1.named)('$jsModule', (0, extension_utils_1.forKey)('$jsModule', (0, extension_utils_1.validateOptions)((SchemaBuilder) => SchemaBuilder.stringSchema(), (value) => async (parse, _, source) => {
        var _a;
        const resolvedPath = (0, node_1.resolveFilepath)(source, value);
        let loaded = await (_a = resolvedPath, Promise.resolve().then(() => __importStar(require(_a))));
        if (!loaded) {
            return parse(loaded, { shouldFlatten: true });
        }
        if ('default' in loaded) {
            loaded = loaded.default;
        }
        if (typeof loaded === 'function') {
            loaded = loaded();
        }
        return parse(loaded, { shouldFlatten: true });
    })));
}
exports.default = jsModuleDirective;
//# sourceMappingURL=index.js.map