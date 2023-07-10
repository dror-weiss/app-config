"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@app-config/core");
const node_1 = require("@app-config/node");
const test_utils_1 = require("@app-config/test-utils");
const index_1 = __importDefault(require("./index"));
describe('$jsModule directive', () => {
    it('loads function node export', () => (0, test_utils_1.withTempFiles)({
        'foo.js': `
        module.exports = () => 'bar';
      `,
    }, async (inDir) => {
        const source = new core_1.LiteralSource({
            $jsModule: inDir('foo.js'),
        });
        expect(await source.readToJSON([(0, index_1.default)()])).toEqual('bar');
    }));
    it('loads default function node export', () => (0, test_utils_1.withTempFiles)({
        'foo.js': `
        module.exports.__esModule = true;
        module.exports.default = () => 'bar';
      `,
    }, async (inDir) => {
        const source = new core_1.LiteralSource({
            $jsModule: inDir('foo.js'),
        });
        expect(await source.readToJSON([(0, index_1.default)()])).toEqual('bar');
    }));
    it('loads object node export', () => (0, test_utils_1.withTempFiles)({
        'foo.js': `
        module.exports = 'bar';
      `,
    }, async (inDir) => {
        const source = new core_1.LiteralSource({
            $jsModule: inDir('foo.js'),
        });
        expect(await source.readToJSON([(0, index_1.default)()])).toEqual('bar');
    }));
    it('loads default object node export', () => (0, test_utils_1.withTempFiles)({
        'foo.js': `
        module.exports.__esModule = true;
        module.exports.default = 'bar';
      `,
    }, async (inDir) => {
        const source = new core_1.LiteralSource({
            $jsModule: inDir('foo.js'),
        });
        expect(await source.readToJSON([(0, index_1.default)()])).toEqual('bar');
    }));
    it('loads file relative to app-config', () => (0, test_utils_1.withTempFiles)({
        'config.yml': `
          $jsModule: ./foo.js
        `,
        'foo.js': `
          module.exports.__esModule = true;
          module.exports.default = 'bar';
        `,
    }, async (inDir) => {
        const source = new node_1.FileSource(inDir('config.yml'));
        expect(await source.readToJSON([(0, index_1.default)()])).toEqual('bar');
    }));
});
//# sourceMappingURL=index.test.js.map