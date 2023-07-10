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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rollup_1 = __importDefault(require("@app-config/rollup"));
__exportStar(require("@app-config/rollup"), exports);
function appConfigVite(options = {}) {
    const plugin = (0, rollup_1.default)(options);
    let watcher;
    return Object.assign(Object.assign({}, plugin), { name: '@app-config/vite', configureServer(server) {
            watcher = server.watcher;
        },
        async load(id) {
            var _a;
            // @ts-ignore
            // eslint-disable-next-line
            const result = await plugin.load.call(this, id);
            watcher === null || watcher === void 0 ? void 0 : watcher.add((_a = plugin.currentFilePaths) !== null && _a !== void 0 ? _a : []);
            return result;
        },
        async handleHotUpdate({ server, file }) {
            var _a;
            if ((_a = plugin.currentFilePaths) === null || _a === void 0 ? void 0 : _a.includes(file)) {
                server.ws.send({ type: 'full-reload' });
                return [];
            }
        } });
}
exports.default = appConfigVite;
//# sourceMappingURL=index.js.map