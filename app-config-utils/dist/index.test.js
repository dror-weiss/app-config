"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
describe('isNode', () => {
    it('detects node.js env', () => {
        expect(index_1.isNode).toBe(true);
    });
});
describe('isObject', () => {
    it('marks an object as an object', () => {
        expect((0, index_1.isObject)({})).toBe(true);
        expect((0, index_1.isObject)([])).toBe(false);
        expect((0, index_1.isObject)(null)).toBe(false);
        expect((0, index_1.isObject)(42)).toBe(false);
        expect((0, index_1.isObject)('foobar')).toBe(false);
    });
});
describe('isPrimitive', () => {
    it('marks primitives as such', () => {
        expect((0, index_1.isPrimitive)(null)).toBe(true);
        expect((0, index_1.isPrimitive)(42)).toBe(true);
        expect((0, index_1.isPrimitive)('foobar')).toBe(true);
        expect((0, index_1.isPrimitive)([])).toBe(false);
        expect((0, index_1.isPrimitive)({})).toBe(false);
    });
});
describe('generateModuleText', () => {
    it('creates config module', () => {
        expect((0, index_1.generateModuleText)({
            foo: 'bar',
        }, {
            environment: 'test',
            useGlobalNamespace: false,
            esmValidationCode: false,
            validationFunctionCode: undefined,
        })).toMatchSnapshot();
    });
    it('creates config module with global namespace', () => {
        expect((0, index_1.generateModuleText)({
            foo: 'bar',
        }, {
            environment: 'test',
            useGlobalNamespace: true,
            esmValidationCode: false,
            validationFunctionCode: undefined,
        })).toMatchSnapshot();
    });
    it('creates config module with noBundledConfig', () => {
        expect((0, index_1.generateModuleText)(undefined, {
            environment: 'test',
            useGlobalNamespace: true,
            esmValidationCode: false,
            validationFunctionCode: undefined,
        })).toMatchSnapshot();
    });
    it('creates config module with validation function', () => {
        expect((0, index_1.generateModuleText)({
            foo: 'bar',
        }, {
            environment: 'test',
            useGlobalNamespace: true,
            esmValidationCode: false,
            // @ts-ignore
            validationFunctionCode: () => {
                return `
              const foo = 'bar';
            `;
            },
        })).toMatchSnapshot();
    });
    it('creates config module with esm validation function', () => {
        expect((0, index_1.generateModuleText)({
            foo: 'bar',
        }, {
            environment: 'test',
            useGlobalNamespace: true,
            esmValidationCode: true,
            // @ts-ignore
            validationFunctionCode: () => {
                return ['import foo from "bar";', `const foo = 'bar';`];
            },
        })).toMatchSnapshot();
    });
});
//# sourceMappingURL=index.test.js.map