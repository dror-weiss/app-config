"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@app-config/core");
const index_1 = __importDefault(require("./index"));
describe('$git directive', () => {
    it('retrieves the commit ref', async () => {
        const source = new core_1.LiteralSource({
            gitRef: { $git: 'commit' },
        });
        const parsed = await source.read([
            (0, index_1.default)(() => Promise.resolve({
                commitRef: '6e96485ebf21082949c97a477b529b7a1c97a8b9',
                branchName: 'master',
            })),
        ]);
        expect(parsed.toJSON()).toEqual({ gitRef: '6e96485ebf21082949c97a477b529b7a1c97a8b9' });
    });
    it('retrieves the short commit ref', async () => {
        const source = new core_1.LiteralSource({
            gitRef: { $git: 'commitShort' },
        });
        const parsed = await source.read([
            (0, index_1.default)(() => Promise.resolve({
                commitRef: '6e96485ebf21082949c97a477b529b7a1c97a8b9',
                branchName: 'master',
            })),
        ]);
        expect(parsed.toJSON()).toEqual({ gitRef: '6e96485' });
    });
    it('retrieves the branch name', async () => {
        const source = new core_1.LiteralSource({
            gitRef: { $git: 'branch' },
        });
        const parsed = await source.read([
            (0, index_1.default)(() => Promise.resolve({
                commitRef: '6e96485ebf21082949c97a477b529b7a1c97a8b9',
                branchName: 'master',
            })),
        ]);
        expect(parsed.toJSON()).toEqual({ gitRef: 'master' });
    });
    it('fails when no branch is checked out', async () => {
        const source = new core_1.LiteralSource({
            gitRef: { $git: 'branch' },
        });
        await expect(source.read([
            (0, index_1.default)(() => Promise.resolve({
                commitRef: '6e96485ebf21082949c97a477b529b7a1c97a8b9',
            })),
        ])).rejects.toThrow();
    });
    it('sets tag', async () => {
        const source = new core_1.LiteralSource({
            gitRef: { $git: 'tag' },
        });
        const parsed = await source.read([
            (0, index_1.default)(() => Promise.resolve({
                commitRef: '6e96485ebf21082949c97a477b529b7a1c97a8b9',
                tag: 'v1.1.1',
            })),
        ]);
        expect(parsed.toJSON()).toEqual({ gitRef: 'v1.1.1' });
    });
    it('allows empty tag', async () => {
        const source = new core_1.LiteralSource({
            gitRef: { $git: 'tag' },
        });
        const parsed = await source.read([
            (0, index_1.default)(() => Promise.resolve({
                commitRef: '6e96485ebf21082949c97a477b529b7a1c97a8b9',
            })),
        ]);
        expect(parsed.toJSON()).toEqual({ gitRef: null });
    });
});
//# sourceMappingURL=index.test.js.map