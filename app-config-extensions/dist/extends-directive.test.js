"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_utils_1 = require("@app-config/test-utils");
const core_1 = require("@app-config/core");
const node_1 = require("@app-config/node");
const extends_directive_1 = require("./extends-directive");
const index_1 = require("./index");
describe('$extends directive', () => {
    it('fails if file is missing', async () => {
        const source = new core_1.LiteralSource({
            $extends: './test-file.json',
        });
        await expect(source.read([(0, extends_directive_1.extendsDirective)()])).rejects.toBeInstanceOf(core_1.NotFoundError);
    });
    it('merges in file at top level', async () => {
        await (0, test_utils_1.withTempFiles)({
            'test-file.json': `{ "foo": true }`,
        }, async (inDir) => {
            const source = new core_1.LiteralSource({
                $extends: inDir('test-file.json'),
            });
            const parsed = await source.read([(0, extends_directive_1.extendsDirective)()]);
            expect(parsed.toJSON()).toEqual({ foo: true });
        });
    });
    it('merges two files', async () => {
        await (0, test_utils_1.withTempFiles)({
            'referenced-file.json': `{ "foo": true }`,
            'test-file.json': `{ "$extends": "./referenced-file.json", "bar": true }`,
        }, async (inDir) => {
            const source = new node_1.FileSource(inDir('test-file.json'));
            const parsed = await source.read([(0, extends_directive_1.extendsDirective)()]);
            expect(parsed.toJSON()).toEqual({ foo: true, bar: true });
        });
    });
    it('merges two files with env in extends file and global env override', async () => {
        await (0, test_utils_1.withTempFiles)({
            'referenced-file.json': `{ "foo": { "$env": { "prod": true, "qa": false } } }`,
            'test-file.json': `{ "$extends": "./referenced-file.json", "bar": true }`,
        }, async (inDir) => {
            const source = new node_1.FileSource(inDir('test-file.json'));
            const parsed = await source.read([(0, extends_directive_1.extendsDirective)(), (0, index_1.envDirective)()], {
                environmentOptions: { override: 'prod' },
            });
            expect(parsed.toJSON()).toEqual({ foo: true, bar: true });
        });
    });
    it('merges many files (flat)', async () => {
        await (0, test_utils_1.withTempFiles)({
            'referenced-file-1.json': `{ "foo": true }`,
            'referenced-file-2.json': `{ "bar": true }`,
            'referenced-file-3.json': `{ "baz": true }`,
            'test-file.json': `{
          "qux": true,
          "$extends": [
            "./referenced-file-1.json",
            "./referenced-file-2.json",
            "./referenced-file-3.json"
          ]
        }`,
        }, async (inDir) => {
            const source = new node_1.FileSource(inDir('test-file.json'));
            const parsed = await source.read([(0, extends_directive_1.extendsDirective)()]);
            expect(parsed.toJSON()).toEqual({ foo: true, bar: true, baz: true, qux: true });
        });
    });
    it('merges many files (recursive)', async () => {
        await (0, test_utils_1.withTempFiles)({
            'referenced-file-3.json': `{ "qux": true, "foo": false }`,
            'referenced-file-2.json': `{ "$extends": "./referenced-file-3.json", "baz": true }`,
            'referenced-file.json': `{ "$extends": "./referenced-file-2.json", "bar": true }`,
            'test-file.json': `{ "$extends": "./referenced-file.json", "foo": true }`,
        }, async (inDir) => {
            const source = new node_1.FileSource(inDir('test-file.json'));
            const parsed = await source.read([(0, extends_directive_1.extendsDirective)()]);
            expect(parsed.toJSON()).toEqual({ foo: true, bar: true, baz: true, qux: true });
        });
    });
    it('reference filepaths are treated relative to cwd of files', async () => {
        await (0, test_utils_1.withTempFiles)({
            'foo/bar/referenced-file-3.json': `{ "qux": true }`,
            'foo/referenced-file-2.json': `{ "$extends": "./bar/referenced-file-3.json", "baz": true }`,
            'foo/referenced-file.json': `{ "$extends": "./referenced-file-2.json", "bar": true }`,
            'test-file.json': `{ "$extends": "./foo/referenced-file.json", "foo": true }`,
        }, async (inDir) => {
            const source = new node_1.FileSource(inDir('test-file.json'));
            const parsed = await source.read([(0, extends_directive_1.extendsDirective)()]);
            expect(parsed.toJSON()).toEqual({ foo: true, bar: true, baz: true, qux: true });
        });
    });
    it('relative filepaths in complex tree structure', async () => {
        await (0, test_utils_1.withTempFiles)({
            'bar/ref.json5': `{
          bar: true,
        }`,
            'baz/ref.json5': `{
          baz: true,
        }`,
            'foo/ref.json5': `{
          foo: true,
          // ref.json5
          $extends: "../ref.json5",
          bar: {
            // bar/ref.json5
            $extends: "../bar/ref.json5",
          },
        }`,
            'ref.json5': `{
          baz: {
            // baz/ref.json5
            $extends: "./baz/ref.json5",
          },
        }`,
            'test-file.json5': `{
          root: true,
          $extends: "./foo/ref.json5",
        }`,
        }, async (inDir) => {
            const source = new node_1.FileSource(inDir('test-file.json5'));
            const parsed = await source.read([(0, extends_directive_1.extendsDirective)()]);
            expect(parsed.toJSON()).toEqual({
                root: true,
                // foo/ref.json5
                foo: true,
                // foo/ref.json5 -> ../ref.json5 -> baz
                baz: {
                    // baz/ref.json5
                    baz: true,
                },
                bar: {
                    // bar/ref.json5
                    bar: true,
                },
            });
        });
    });
    it('merges two files with an override', async () => {
        await (0, test_utils_1.withTempFiles)({
            'referenced-file.json': `{ "foo": true, "bar": true }`,
            'test-file.json': `{ "$extends": "./referenced-file.json", "bar": false }`,
        }, async (inDir) => {
            const source = new node_1.FileSource(inDir('test-file.json'));
            const parsed = await source.read([(0, extends_directive_1.extendsDirective)()]);
            expect(parsed.toJSON()).toEqual({ foo: true, bar: false });
        });
    });
    it('supports object notation', async () => {
        await (0, test_utils_1.withTempFiles)({
            'referenced-file.json': `{ "foo": true }`,
            'test-file.json': `{
          "$extends": { "path": "./referenced-file.json" },
          "bar": false
        }`,
        }, async (inDir) => {
            const source = new node_1.FileSource(inDir('test-file.json'));
            const parsed = await source.read([(0, extends_directive_1.extendsDirective)()]);
            expect(parsed.toJSON()).toEqual({ foo: true, bar: false });
        });
    });
    it('allows optional extending files', async () => {
        await (0, test_utils_1.withTempFiles)({
            'test-file.json': `{
          "$extends": { "path": "./referenced-file.json", "optional": true },
          "foo": true
        }`,
        }, async (inDir) => {
            const source = new node_1.FileSource(inDir('test-file.json'));
            const parsed = await source.read([(0, extends_directive_1.extendsDirective)()]);
            expect(parsed.toJSON()).toEqual({ foo: true });
        });
    });
    it('selects specific properties', async () => {
        await (0, test_utils_1.withTempFiles)({
            'referenced-file.json': `{ "foo": { "bar": { "baz": true } } }`,
            'test-file.json': `{
          "$extends": { "path": "./referenced-file.json", "select": "foo.bar" },
          "foo": true
        }`,
        }, async (inDir) => {
            const source = new node_1.FileSource(inDir('test-file.json'));
            const parsed = await source.read([(0, extends_directive_1.extendsDirective)()]);
            expect(parsed.toJSON()).toEqual({ foo: true, baz: true });
        });
    });
    it('selects a non-object property', async () => {
        await (0, test_utils_1.withTempFiles)({
            'referenced-file.json': `{ "foo": 42, "bar": { "a": true, "b": true } }`,
            'test-file.yaml': `
          foo:
            $extends:
              path: ./referenced-file.json
              select: 'bar'
          bar:
            $extends:
              path: ./referenced-file.json
              select: 'foo'
        `,
        }, async (inDir) => {
            const source = new node_1.FileSource(inDir('test-file.yaml'));
            const parsed = await source.read([(0, extends_directive_1.extendsDirective)()]);
            expect(parsed.toJSON()).toEqual({ foo: { a: true, b: true }, bar: 42 });
        });
    });
});
describe('$extendsSelf directive', () => {
    it('fails when $extendsSelf selector is invalid', async () => {
        const source = new core_1.LiteralSource({
            foo: {
                $extendsSelf: 'foo.bar',
            },
        });
        await expect(source.read([(0, extends_directive_1.extendsSelfDirective)()])).rejects.toThrow();
    });
    it('fails when $extendsSelf selector is invalid object', async () => {
        const source = new core_1.LiteralSource({
            foo: {
                $extendsSelf: {},
            },
        });
        await expect(source.read([(0, extends_directive_1.extendsSelfDirective)()])).rejects.toThrow();
    });
    it('resolves with select option', async () => {
        const source = new core_1.LiteralSource({
            foo: {
                $extendsSelf: {
                    select: 'bar',
                },
            },
            bar: 42,
        });
        expect(await source.readToJSON([(0, extends_directive_1.extendsSelfDirective)()])).toEqual({ foo: 42, bar: 42 });
    });
    it('resolves with select and env option', async () => {
        const source = new core_1.LiteralSource({
            foo: {
                $extendsSelf: {
                    select: 'bar',
                    env: 'qa',
                },
            },
            bar: {
                $substitute: '$APP_CONFIG_ENV',
            },
        });
        expect(await source.readToJSON([(0, extends_directive_1.extendsSelfDirective)(), (0, index_1.substituteDirective)()])).toEqual({
            foo: 'qa',
            bar: 'test',
        });
    });
    it('resolves with select and env option', async () => {
        const source = new core_1.LiteralSource({
            foo: {
                $extendsSelf: {
                    select: 'bar',
                    env: 'qa',
                },
            },
            bar: {
                $env: {
                    default: 42,
                    qa: 88,
                },
            },
        });
        expect(await source.readToJSON([(0, extends_directive_1.extendsSelfDirective)(), (0, index_1.envDirective)()])).toEqual({
            foo: 88,
            bar: 42,
        });
    });
    it('resolves with select and env option', async () => {
        const source = new core_1.LiteralSource({
            foo: {
                $env: {
                    default: 'default',
                    staging: 'staging',
                },
            },
            bar: {
                $envVar: 'APP_CONFIG_ENV',
            },
            baz: 'default',
            $env: {
                default: {},
                qa: {
                    $extendsSelf: {
                        env: 'staging',
                        select: '.',
                    },
                    baz: 'qa',
                },
            },
        });
        process.env.APP_CONFIG_ENV = 'qa';
        expect(await source.readToJSON([(0, extends_directive_1.extendsSelfDirective)(), (0, index_1.envVarDirective)(), (0, index_1.envDirective)()])).toEqual({
            foo: 'staging',
            bar: 'staging',
            baz: 'qa',
        });
    });
    it('resolves a simple $extendsSelf selector', async () => {
        const source = new core_1.LiteralSource({
            foo: {
                bar: {
                    baz: 42,
                },
            },
            qux: {
                $extendsSelf: 'foo.bar',
            },
        });
        const parsed = await source.read([(0, extends_directive_1.extendsSelfDirective)()]);
        expect(parsed.toJSON()).toEqual({
            foo: { bar: { baz: 42 } },
            qux: { baz: 42 },
        });
    });
    it('resolves a $extendsSelf selector to a literal value', async () => {
        const source = new core_1.LiteralSource({
            foo: {
                bar: {
                    baz: 42,
                },
            },
            qux: {
                $extendsSelf: 'foo.bar.baz',
            },
        });
        const parsed = await source.read([(0, extends_directive_1.extendsSelfDirective)()]);
        expect(parsed.toJSON()).toEqual({
            foo: { bar: { baz: 42 } },
            qux: 42,
        });
    });
    it('resolves an $extends selector to own file', async () => {
        await (0, test_utils_1.withTempFiles)({
            'test-file.yaml': `
          foo:
            bar:
              baz: 42

          qux:
            $extends:
              path: './test-file.yaml'
              selector: '.foo.bar'
        `,
        }, async (inDir) => {
            const source = new core_1.LiteralSource({
                $extends: inDir('test-file.yaml'),
            });
            await expect(source.read([(0, extends_directive_1.extendsDirective)()])).rejects.toThrow();
        });
    });
});
describe('$override directive', () => {
    it('fails if file is missing', async () => {
        const source = new core_1.LiteralSource({
            $override: './test-file.json',
        });
        await expect(source.read([(0, extends_directive_1.overrideDirective)()])).rejects.toBeInstanceOf(core_1.NotFoundError);
    });
    it('merges two files', async () => {
        await (0, test_utils_1.withTempFiles)({
            'referenced-file.json': `{ "foo": true }`,
            'test-file.json': `{ "$override": "./referenced-file.json", "bar": true }`,
        }, async (inDir) => {
            const source = new node_1.FileSource(inDir('test-file.json'));
            const parsed = await source.read([(0, extends_directive_1.overrideDirective)()]);
            expect(parsed.toJSON()).toEqual({ foo: true, bar: true });
        });
    });
    it('merges two files with an override', async () => {
        await (0, test_utils_1.withTempFiles)({
            'referenced-file.json': `{ "foo": true, "bar": true }`,
            'test-file.json': `{ "$override": "./referenced-file.json", "bar": false }`,
        }, async (inDir) => {
            const source = new node_1.FileSource(inDir('test-file.json'));
            const parsed = await source.read([(0, extends_directive_1.overrideDirective)()]);
            expect(parsed.toJSON()).toEqual({ foo: true, bar: true });
        });
    });
    it('merges many files (recursive)', async () => {
        await (0, test_utils_1.withTempFiles)({
            'referenced-file-3.json': `{ "qux": true, "foo": false }`,
            'referenced-file-2.json': `{ "$override": "./referenced-file-3.json", "baz": true }`,
            'referenced-file.json': `{ "$override": "./referenced-file-2.json", "bar": true }`,
            'test-file.json': `{ "$override": "./referenced-file.json", "foo": true, "bar": false, "baz": false }`,
        }, async (inDir) => {
            const source = new node_1.FileSource(inDir('test-file.json'));
            const parsed = await source.read([(0, extends_directive_1.overrideDirective)()]);
            expect(parsed.toJSON()).toEqual({ foo: false, bar: true, baz: true, qux: true });
        });
    });
    it('merges many files (flat)', async () => {
        await (0, test_utils_1.withTempFiles)({
            'referenced-file-1.json': `{ "foo": true }`,
            'referenced-file-2.json': `{ "bar": true }`,
            'referenced-file-3.json': `{ "baz": true }`,
            'test-file.json': `{
          "qux": true,
          "$override": [
            "./referenced-file-1.json",
            "./referenced-file-2.json",
            "./referenced-file-3.json"
          ]
        }`,
        }, async (inDir) => {
            const source = new node_1.FileSource(inDir('test-file.json'));
            const parsed = await source.read([(0, extends_directive_1.overrideDirective)()]);
            expect(parsed.toJSON()).toEqual({ foo: true, bar: true, baz: true, qux: true });
        });
    });
    it('extends env', async () => {
        await (0, test_utils_1.withTempFiles)({
            'test-file.yml': `
          bar:
            $env:
              default: 44
              dev: 88
        `,
        }, async (inDir) => {
            const source = new core_1.LiteralSource({
                foo: {
                    $env: {
                        default: 44,
                        dev: 88,
                    },
                },
                $extends: {
                    path: inDir('test-file.yml'),
                    env: 'development',
                },
            });
            const parsed = await source.read([(0, index_1.envDirective)(), (0, extends_directive_1.extendsDirective)()]);
            expect(parsed.toJSON()).toEqual({ foo: 44, bar: 88 });
        });
    });
    it('extends env and $envVar', async () => {
        await (0, test_utils_1.withTempFiles)({
            'test-file.yml': `
          bar:
            $envVar: APP_CONFIG_ENV
        `,
        }, async (inDir) => {
            process.env.APP_CONFIG_ENV = 'test';
            const source = new core_1.LiteralSource({
                foo: {
                    $envVar: 'APP_CONFIG_ENV',
                },
                $extends: {
                    path: inDir('test-file.yml'),
                    env: 'development',
                },
            });
            const parsed = await source.read([(0, extends_directive_1.extendsDirective)(), (0, index_1.envVarDirective)()]);
            expect(parsed.toJSON()).toEqual({ foo: 'test', bar: 'development' });
        });
    });
    it('extends env and $substitute', async () => {
        await (0, test_utils_1.withTempFiles)({
            'test-file.yml': `
          bar:
            $substitute: '$APP_CONFIG_ENV'
        `,
        }, async (inDir) => {
            process.env.APP_CONFIG_ENV = 'test';
            const source = new core_1.LiteralSource({
                foo: {
                    $substitute: '$APP_CONFIG_ENV',
                },
                $extends: {
                    path: inDir('test-file.yml'),
                    env: 'development',
                },
            });
            const parsed = await source.read([(0, extends_directive_1.extendsDirective)(), (0, index_1.substituteDirective)()]);
            expect(parsed.toJSON()).toEqual({ foo: 'test', bar: 'development' });
        });
    });
    it('extends env multiple files', async () => {
        await (0, test_utils_1.withTempFiles)({
            'test-file.yml': `
          foo:
            $env:
              default: 44
              dev: 88
        `,
            'test-file-2.yml': `
          bar:
            $env:
              default: 44
              dev: 88
              prod: 142
        `,
        }, async (inDir) => {
            const source = new core_1.LiteralSource({
                $extends: [
                    {
                        path: inDir('test-file.yml'),
                        env: 'development',
                    },
                    {
                        path: inDir('test-file-2.yml'),
                        env: 'production',
                    },
                ],
            });
            const parsed = await source.read([(0, index_1.envDirective)(), (0, extends_directive_1.extendsDirective)()]);
            expect(parsed.toJSON()).toEqual({ foo: 88, bar: 142 });
        });
    });
    it('override env', async () => {
        await (0, test_utils_1.withTempFiles)({
            'test-file.yml': `
          bar:
            $env:
              default: 44
              dev: 88
        `,
        }, async (inDir) => {
            const source = new core_1.LiteralSource({
                foo: {
                    $env: {
                        default: 44,
                        dev: 88,
                    },
                },
                $override: {
                    path: inDir('test-file.yml'),
                    env: 'development',
                },
            });
            const parsed = await source.read([(0, index_1.envDirective)(), (0, extends_directive_1.overrideDirective)()]);
            expect(parsed.toJSON()).toEqual({ foo: 44, bar: 88 });
        });
    });
    it('override env multiple files', async () => {
        await (0, test_utils_1.withTempFiles)({
            'test-file.yml': `
          foo:
            $env:
              default: 44
              dev: 88
        `,
            'test-file-2.yml': `
          bar:
            $env:
              default: 44
              dev: 88
              prod: 142
        `,
        }, async (inDir) => {
            const source = new core_1.LiteralSource({
                $override: [
                    {
                        path: inDir('test-file.yml'),
                        env: 'development',
                    },
                    {
                        path: inDir('test-file-2.yml'),
                        env: 'production',
                    },
                ],
            });
            const parsed = await source.read([(0, index_1.envDirective)(), (0, extends_directive_1.overrideDirective)()]);
            expect(parsed.toJSON()).toEqual({ foo: 88, bar: 142 });
        });
    });
});
//# sourceMappingURL=extends-directive.test.js.map