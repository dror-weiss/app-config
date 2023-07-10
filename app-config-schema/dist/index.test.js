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
const core_1 = require("@app-config/core");
const test_utils_1 = require("@app-config/test-utils");
const encryption_1 = __importStar(require("@app-config/encryption"));
const extensions_1 = require("@app-config/extensions");
const index_1 = require("./index");
describe('Schema Loading', () => {
    it('fails when no schema is present', async () => {
        await expect((0, index_1.loadSchema)()).rejects.toThrow();
    });
    it('loads schema from APP_CONFIG_SCHEMA variable', async () => {
        process.env.APP_CONFIG_SCHEMA = JSON.stringify({
            type: 'object',
            properties: { foo: { type: 'string' } },
        });
        const { schema: value } = await (0, index_1.loadSchema)();
        expect(value).toMatchObject({
            type: 'object',
            properties: { foo: { type: 'string' } },
        });
    });
    it('loads a simple YAML schema', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.schema.yml': `
          type: object
          properties:
            foo: { type: string }
        `,
        }, async (inDir) => {
            const { schema: value } = await (0, index_1.loadSchema)({ directory: inDir('.') });
            expect(value).toMatchObject({
                type: 'object',
                properties: {
                    foo: { type: 'string' },
                },
            });
        });
    });
    it('loads a simple JSON schema', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.schema.json': `{
          "type": "object",
          "properties": {
            "foo": { "type": "string" }
          }
        }`,
        }, async (inDir) => {
            const { schema: value } = await (0, index_1.loadSchema)({ directory: inDir('.') });
            expect(value).toMatchObject({
                type: 'object',
                properties: {
                    foo: { type: 'string' },
                },
            });
        });
    });
    it('loads a simple JSON5 schema', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.schema.json5': `{
          type: "object",
          properties: {
            foo: { type: "string" },
          },
        }`,
        }, async (inDir) => {
            const { schema: value } = await (0, index_1.loadSchema)({ directory: inDir('.') });
            expect(value).toMatchObject({
                type: 'object',
                properties: {
                    foo: { type: 'string' },
                },
            });
        });
    });
    it('loads a simple TOML schema', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.schema.toml': `
          type = "object"

          [properties]
          foo = { type = "string" }
        `,
        }, async (inDir) => {
            const { schema: value } = await (0, index_1.loadSchema)({ directory: inDir('.') });
            expect(value).toMatchObject({
                type: 'object',
                properties: {
                    foo: { type: 'string' },
                },
            });
        });
    });
    it('loads a schema with $extends directive when given', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.schema.yml': `
          type: object
          properties:
            foo: { $extends: ./ref.yml }
        `,
            'ref.yml': `
          type: string
        `,
        }, async (inDir) => {
            const { schema: value } = await (0, index_1.loadSchema)({
                directory: inDir('.'),
                parsingExtensions: [(0, extensions_1.extendsDirective)()],
            });
            expect(value).toMatchObject({
                type: 'object',
                properties: {
                    foo: { type: 'string' },
                },
            });
        });
    });
    describe('References', () => {
        it('resolves schema $ref to a TOML file', async () => {
            await (0, test_utils_1.withTempFiles)({
                '.app-config.schema.yml': `
            type: object
            properties:
              a:
                $ref: './referenced.schema.toml#/definitions/A'
          `,
                'referenced.schema.toml': `
            [definitions]
            A = { "type" = "number" }
          `,
            }, async (inDir) => {
                const { schema } = await (0, index_1.loadSchema)({ directory: inDir('.') });
                expect(schema.properties).toEqual({ a: { type: 'number' } });
            });
        });
        it('resolves schema $ref to a JSON file', async () => {
            await (0, test_utils_1.withTempFiles)({
                '.app-config.schema.yml': `
            type: object
            properties:
              a:
                $ref: './referenced.schema.json#/definitions/A'
          `,
                'referenced.schema.json': `{
            "definitions": {
              "A": { "type": "number" }
            }
          }`,
            }, async (inDir) => {
                const { schema } = await (0, index_1.loadSchema)({ directory: inDir('.') });
                expect(schema.properties).toEqual({ a: { type: 'number' } });
            });
        });
        it('resolves schema $ref to a JSON5 file', async () => {
            await (0, test_utils_1.withTempFiles)({
                '.app-config.schema.yml': `
            type: object
            properties:
              a:
                $ref: './referenced.schema.json5#/definitions/A'
          `,
                'referenced.schema.json5': `{
            definitions: {
              A: { type: "number" }
            }
          }`,
            }, async (inDir) => {
                const { schema } = await (0, index_1.loadSchema)({ directory: inDir('.') });
                expect(schema.properties).toEqual({ a: { type: 'number' } });
            });
        });
        it('resolves schema $ref to a YAML file', async () => {
            await (0, test_utils_1.withTempFiles)({
                '.app-config.schema.yml': `
            type: object
            properties:
              a:
                $ref: './referenced.schema.yaml#/definitions/A'
          `,
                'referenced.schema.yaml': `
            definitions:
              A: { type: 'number' }
          `,
            }, async (inDir) => {
                const { schema } = await (0, index_1.loadSchema)({ directory: inDir('.') });
                expect(schema.properties).toEqual({ a: { type: 'number' } });
            });
        });
        it('loads a schema $ref relative to itself', async () => {
            await (0, test_utils_1.withTempFiles)({
                'nested-folder/.app-config.schema.yml': `
            type: object
            required: [x]
            properties:
              x: { $ref: '../rootlevel.schema.yml#/Nested' }
          `,
                'rootlevel.schema.yml': `
            Nested:
              type: number
          `,
            }, async (inDir) => {
                await (0, index_1.loadSchema)({ directory: inDir('nested-folder') });
            });
        });
        it("loads a schema $ref relative to the file it's in", async () => {
            await (0, test_utils_1.withTempFiles)({
                'nested-folder/.app-config.schema.yml': `
            type: object
            required: [x]
            properties:
              x: { $ref: '../nested-folder-2/rootlevel.schema.yml#/definitions/Nested' }
          `,
                'nested-folder-2/rootlevel.schema.yml': `
            definitions:
              Nested: { $ref: '../nested-folder-3/.app-config.schema.yml#/definitions/Nested2' }
          `,
                'nested-folder-3/.app-config.schema.yml': `
            definitions:
              Nested2:
                type: string
          `,
            }, async (inDir) => {
                await (0, index_1.loadSchema)({ directory: inDir('nested-folder') });
            });
        });
        it('resolves multiple schema $ref properties to the same schema', async () => {
            await (0, test_utils_1.withTempFiles)({
                '.app-config.schema.yml': `
            type: object
            properties:
              a:  { $ref: './referenced.schema.yml#/definitions/A' }
              aa: { $ref: './referenced.schema.yml#/definitions/A' }
              b:  { $ref: './referenced.schema.yml#/definitions/B' }
          `,
                'referenced.schema.yml': `
            definitions:
              A: { type: number }
              B: { type: number }
          `,
            }, async (inDir) => {
                await (0, index_1.loadSchema)({ directory: inDir('.') });
            });
        });
        it('resolves schema $ref properties that appear in arrays', async () => {
            await (0, test_utils_1.withTempFiles)({
                '.app-config.schema.yml': `
            type: object
            properties:
              a:
                oneOf:
                  - { $ref: './referenced.schema.yml#/definitions/A' }
                  - { $ref: './referenced.schema.yml#/definitions/B' }
          `,
                'referenced.schema.yml': `
            definitions:
              A: { type: number }
              B: { type: number }
          `,
            }, async (inDir) => {
                await (0, index_1.loadSchema)({ directory: inDir('.') });
            });
        });
        it('handles circular references', async () => {
            await (0, test_utils_1.withTempFiles)({
                'a/.app-config.schema.yml': `
            type: object
            properties:
              x: { $ref: '../b/.app-config.schema.yml#/definitions/B' }
            definitions:
              A: { type: string }
          `,
                'b/.app-config.schema.yml': `
            type: object
            properties:
              x: { $ref: '../a/.app-config.schema.yml#/definitions/A' }
            definitions:
              B: { type: string }
          `,
            }, async (inDir) => {
                const { schema: a } = await (0, index_1.loadSchema)({ directory: inDir('a') });
                const { schema: b } = await (0, index_1.loadSchema)({ directory: inDir('b') });
                expect(a).toMatchObject({
                    properties: {
                        x: {
                            type: 'string',
                        },
                    },
                });
                expect(b).toMatchObject({
                    properties: {
                        x: {
                            type: 'string',
                        },
                    },
                });
            });
        });
        it('handles schema ref filepath with space in filepath', async () => {
            await (0, test_utils_1.withTempFiles)({
                '.app-config.schema.yml': `
            type: object
            properties:
              x: { $ref: 'my schema.yml#/definitions/B' }
          `,
                'my schema.yml': `
            type: object
            definitions:
              B: { type: string }
          `,
            }, async (inDir) => {
                const { schema: value } = await (0, index_1.loadSchema)({ directory: inDir('.') });
                expect(value).toMatchObject({
                    properties: {
                        x: {
                            type: 'string',
                        },
                    },
                });
            });
        });
    });
});
describe('Validation', () => {
    it('validates properties', async () => {
        await (0, test_utils_1.withTempFiles)({
            '.app-config.schema.yml': `
          type: object
          required: [foo]
          properties:
            foo: { type: string }
        `,
        }, async (inDir) => {
            const { validate } = await (0, index_1.loadSchema)({ directory: inDir('.') });
            expect(() => validate({})).toThrow();
            expect(() => validate({ foo: true })).toThrow();
            expect(() => validate({ foo: '' })).not.toThrow();
        });
    });
    describe('Secrets', () => {
        it('detects when secrets are in nonSecrets', async () => {
            await (0, test_utils_1.withTempFiles)({
                '.app-config.schema.yml': `
          type: object
          properties:
            foo: { type: string }
            bar: { type: string, secret: true }
        `,
            }, async (inDir) => {
                const { validate } = await (0, index_1.loadSchema)({ directory: inDir('.') });
                expect(() => validate({ foo: '', bar: '' })).not.toThrow();
                expect(() => validate({ foo: '', bar: '' }, core_1.ParsedValue.literal({}))).not.toThrow();
                expect(() => validate({ foo: '', bar: '' }, core_1.ParsedValue.literal({ bar: '' }))).toThrow();
                expect(() => 
                // it's okay here to put foo in nonSecrets
                validate({ foo: '', bar: '' }, core_1.ParsedValue.literal({ foo: '' }))).not.toThrow();
            });
        });
        it('detects when secrets are in nonSecrets in a nested structure', async () => {
            await (0, test_utils_1.withTempFiles)({
                '.app-config.schema.yml': `
          type: object
          properties:
            user:
              type: object
              properties:
                login:
                  type: object
                  properties:
                    password:
                      type: string
                      secret: true
        `,
            }, async (inDir) => {
                const { validate } = await (0, index_1.loadSchema)({ directory: inDir('.') });
                expect(() => validate({ user: { login: { password: 'pwd' } } }, core_1.ParsedValue.literal({}))).not.toThrow();
                expect(() => validate({ user: { login: { password: 'pwd' } } }, 
                // the secret was present in nonSecrets
                core_1.ParsedValue.literal({ user: { login: { password: 'pwd' } } }))).toThrow();
            });
        });
        it('allows encrypted values in nonSecrets when marked as secret in schema', async () => {
            await (0, test_utils_1.withTempFiles)({
                '.app-config.schema.yml': `
          type: object
          properties:
            foo: { type: string, secret: true }
        `,
            }, async (inDir) => {
                const { validate } = await (0, index_1.loadSchema)({ directory: inDir('.') });
                const symmetricKey = await (0, encryption_1.generateSymmetricKey)(1);
                const parsed = await core_1.ParsedValue.parseLiteral({
                    // we've put foo in nonSecrets, but it should be allowed because it's encrypted
                    foo: await (0, encryption_1.encryptValue)('hello world', symmetricKey),
                }, [(0, encryption_1.default)(symmetricKey)]);
                validate(parsed.toJSON(), parsed);
            });
        });
        it('allows encrypted values in nonSecrets when in an array', async () => {
            await (0, test_utils_1.withTempFiles)({
                '.app-config.schema.yml': `
          type: array
          items:
            type: string
            secret: true
        `,
            }, async (inDir) => {
                const { validate } = await (0, index_1.loadSchema)({ directory: inDir('.') });
                const symmetricKey = await (0, encryption_1.generateSymmetricKey)(1);
                const parsed = await core_1.ParsedValue.parseLiteral([
                    await (0, encryption_1.encryptValue)('secret-1', symmetricKey),
                    await (0, encryption_1.encryptValue)('secret-2', symmetricKey),
                ], [(0, encryption_1.default)(symmetricKey)]);
                validate(parsed.toJSON(), parsed);
            });
        });
        it('disallows one unencrypted value in nonSecrets when in an array', async () => {
            await (0, test_utils_1.withTempFiles)({
                '.app-config.schema.yml': `
          type: array
          items:
            type: string
            secret: true
        `,
            }, async (inDir) => {
                const { validate } = await (0, index_1.loadSchema)({ directory: inDir('.') });
                const symmetricKey = await (0, encryption_1.generateSymmetricKey)(1);
                const parsed = await core_1.ParsedValue.parseLiteral([
                    await (0, encryption_1.encryptValue)('secret-1', symmetricKey),
                    'not-so-secret',
                    await (0, encryption_1.encryptValue)('secret-2', symmetricKey),
                ], [(0, encryption_1.default)(symmetricKey)]);
                expect(() => validate(parsed.toJSON(), parsed)).toThrow();
            });
        });
        it('allows a "secret" array with all secret values, but not secret itself', async () => {
            await (0, test_utils_1.withTempFiles)({
                '.app-config.schema.yml': `
          type: object
          properties:
            foo:
              type: array
              secret: true
              items:
                type: string
        `,
            }, async (inDir) => {
                const { validate } = await (0, index_1.loadSchema)({ directory: inDir('.') });
                const symmetricKey = await (0, encryption_1.generateSymmetricKey)(1);
                const parsed = await core_1.ParsedValue.parseLiteral({
                    foo: [await (0, encryption_1.encryptValue)('secret-1', symmetricKey)],
                }, [(0, encryption_1.default)(symmetricKey), (0, extensions_1.envDirective)()]);
                validate(parsed.toJSON(), parsed);
            });
        });
    });
});
describe('Code Generation', () => {
    beforeEach(() => {
        process.env.APP_CONFIG_SCHEMA = JSON.stringify({
            type: 'object',
            additionalProperties: false,
            required: ['foo'],
            properties: {
                // use format to trigger an ajv-formats import
                foo: { type: 'string', format: 'uri' },
                // use maxLength to trigger an ajv import
                bar: { type: 'string', maxLength: 42 },
            },
        });
    });
    it('validates using the generated code', async () => {
        const { validationFunction } = await (0, index_1.loadSchema)();
        expect(validationFunction({})).toBe(false);
        expect(validationFunction.errors).toHaveLength(1);
        expect(validationFunction.errors).toMatchSnapshot();
        expect(validationFunction({ foo: 'str' })).toBe(false);
        expect(validationFunction({ foo: 'http://google.com' })).toBe(true);
    });
});
//# sourceMappingURL=index.test.js.map