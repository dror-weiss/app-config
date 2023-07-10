"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_utils_1 = require("@app-config/test-utils");
const core_1 = require("@app-config/core");
const index_1 = require("./index");
/* eslint-disable no-template-curly-in-string */
describe('extension combinations', () => {
    it('combines $env and $extends directives', async () => {
        await (0, test_utils_1.withTempFiles)({
            'test-file.json': `{ "foo": true }`,
        }, async (inDir) => {
            const source = new core_1.LiteralSource({
                $extends: {
                    $env: {
                        default: inDir('test-file.json'),
                    },
                },
            });
            const parsed = await source.read([(0, index_1.envDirective)(), (0, index_1.extendsDirective)()]);
            expect(parsed.toJSON()).toEqual({ foo: true });
        });
    });
    it('combines $extends and $env directives', async () => {
        await (0, test_utils_1.withTempFiles)({
            'test-file.json': `{ "foo": true }`,
        }, async (inDir) => {
            process.env.NODE_ENV = 'development';
            const source = new core_1.LiteralSource({
                $env: {
                    default: {
                        $extends: inDir('test-file.json'),
                    },
                    test: {
                        foo: false,
                    },
                },
            });
            const parsed = await source.read([(0, index_1.envDirective)(), (0, index_1.extendsDirective)()]);
            expect(parsed.toJSON()).toEqual({ foo: true });
        });
    });
    it('combines $env and $substitute directives', async () => {
        const source = new core_1.LiteralSource({
            apiUrl: {
                $env: {
                    default: {
                        $substitute: 'http://${MY_IP:-localhost}:3000',
                    },
                    qa: 'http://example.com',
                },
            },
        });
        const parsed = await source.read([(0, index_1.envDirective)(), (0, index_1.substituteDirective)()]);
        expect(parsed.toJSON()).toEqual({ apiUrl: 'http://localhost:3000' });
    });
    it('combines $extends and $substitute directives', async () => {
        await (0, test_utils_1.withTempFiles)({ 'other-file.json': JSON.stringify({ foo: 'bar' }) }, async (inDir) => {
            process.env.SOME_VAR = inDir('./other-file.json');
            const source = new core_1.LiteralSource({
                $extends: {
                    $substitute: '$SOME_VAR',
                },
            });
            const parsed = await source.read([(0, index_1.extendsDirective)(), (0, index_1.substituteDirective)()]);
            expect(parsed.toJSON()).toEqual({ foo: 'bar' });
        });
    });
    it('combines $try and $extends', async () => {
        const source = new core_1.LiteralSource({
            $try: {
                $value: {
                    $extends: './test-file.json',
                },
                $fallback: {
                    fellBack: true,
                },
            },
        });
        await expect(source.readToJSON([(0, index_1.extendsDirective)(), (0, index_1.tryDirective)()])).resolves.toEqual({
            fellBack: true,
        });
    });
    it('combines $if and $eq', async () => {
        const source = new core_1.LiteralSource({
            $if: {
                $check: {
                    $eq: ['foo', 'foo'],
                },
                $then: 'foo',
                $else: 'bar',
            },
        });
        await expect(source.readToJSON([(0, index_1.ifDirective)(), (0, index_1.eqDirective)()])).resolves.toEqual('foo');
    });
    it('combines $envVar and $parseBool directives', async () => {
        process.env.FOO = '1';
        const source = new core_1.LiteralSource({
            featureEnabled: {
                $parseBool: {
                    $envVar: 'FOO',
                },
            },
        });
        const parsed = await source.read([(0, index_1.envVarDirective)(), (0, index_1.parseDirective)()]);
        expect(parsed.toJSON()).toEqual({ featureEnabled: true });
    });
    it('combines $envVar and $parseBool directives 2', async () => {
        const source = new core_1.LiteralSource({
            featureEnabled: {
                $parseBool: {
                    $envVar: { name: 'FOO', allowNull: true, fallback: null },
                },
            },
        });
        const parsed = await source.read([(0, index_1.parseDirective)(), (0, index_1.envVarDirective)()]);
        expect(parsed.toJSON()).toEqual({ featureEnabled: false });
    });
});
//# sourceMappingURL=index.test.js.map