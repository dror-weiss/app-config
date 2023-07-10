"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@app-config/core");
const encryption_1 = require("./encryption");
const index_1 = __importDefault(require("./index"));
describe('encryptedDirective', () => {
    it('loads an encrypted value', async () => {
        const symmetricKey = await (0, encryption_1.generateSymmetricKey)(1);
        const source = new core_1.LiteralSource({
            foo: await (0, encryption_1.encryptValue)('foobar', symmetricKey),
        });
        const parsed = await source.read([(0, index_1.default)(symmetricKey)]);
        expect(parsed.toJSON()).toEqual({ foo: 'foobar' });
    });
    it('loads an array of encrypted values', async () => {
        const symmetricKey = await (0, encryption_1.generateSymmetricKey)(1);
        const source = new core_1.LiteralSource({
            foo: [
                await (0, encryption_1.encryptValue)('value-1', symmetricKey),
                await (0, encryption_1.encryptValue)('value-2', symmetricKey),
                await (0, encryption_1.encryptValue)('value-3', symmetricKey),
            ],
        });
        const parsed = await source.read([(0, index_1.default)(symmetricKey)]);
        expect(parsed.toJSON()).toEqual({ foo: ['value-1', 'value-2', 'value-3'] });
    });
});
//# sourceMappingURL=index.test.js.map