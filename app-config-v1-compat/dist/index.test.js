"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_utils_1 = require("@app-config/test-utils");
const core_1 = require("@app-config/core");
const extensions_1 = require("@app-config/extensions");
const index_1 = __importDefault(require("./index"));
describe('v1Compat', () => {
    it('reads app-config property', async () => {
        await (0, test_utils_1.withTempFiles)({
            'some-file.json': JSON.stringify({ a: 'foo' }),
            'other-file.json': JSON.stringify({ b: 'bar' }),
        }, async (inDir) => {
            const source = new core_1.LiteralSource({
                'app-config': {
                    extends: inDir('./some-file.json'),
                },
                $extends: inDir('./other-file.json'),
            });
            const parsed = await source.read([(0, index_1.default)(), (0, extensions_1.extendsDirective)()]);
            expect(parsed.toJSON()).toEqual({ a: 'foo', b: 'bar' });
        });
    });
});
//# sourceMappingURL=index.test.js.map