"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = require("./environment");
describe('currentEnvironment', () => {
    describe('deprecated currentEnvironment', () => {
        it('uses environmentSourceNames', () => {
            process.env.NODE_ENV = 'foo';
            process.env.FOO = 'bar';
            expect((0, environment_1.currentEnvironment)(undefined, ['FOO', 'BAR'])).toBe('bar');
            expect((0, environment_1.currentEnvironment)(undefined, ['BAR'])).toBe(undefined);
        });
        it('uses environmentAliases', () => {
            process.env.FOO = 'bar';
            process.env.NODE_ENV = 'bar';
            expect((0, environment_1.currentEnvironment)({}, ['FOO'])).toBe('bar');
            expect((0, environment_1.currentEnvironment)({ bar: 'foo' })).toBe('foo');
            expect((0, environment_1.currentEnvironment)({ bar: 'foo' }, ['FOO'])).toBe('foo');
        });
    });
    it('uses envVarNames', () => {
        process.env.NODE_ENV = 'foo';
        process.env.FOO = 'bar';
        expect((0, environment_1.currentEnvironment)({ envVarNames: ['FOO', 'BAR'], aliases: environment_1.defaultAliases })).toBe('bar');
        expect((0, environment_1.currentEnvironment)({ envVarNames: ['BAR'], aliases: environment_1.defaultAliases })).toBe(undefined);
    });
    it('uses aliases', () => {
        process.env.FOO = 'bar';
        process.env.NODE_ENV = 'bar';
        expect((0, environment_1.currentEnvironment)({ envVarNames: ['FOO'], aliases: environment_1.defaultAliases })).toBe('bar');
        expect((0, environment_1.currentEnvironment)({ aliases: { bar: 'foo' }, envVarNames: environment_1.defaultEnvVarNames })).toBe('foo');
        expect((0, environment_1.currentEnvironment)({ aliases: { bar: 'foo' }, envVarNames: ['FOO'] })).toBe('foo');
    });
    it('uses override', () => {
        process.env.NODE_ENV = 'foo';
        expect((0, environment_1.currentEnvironment)({})).toBe('foo');
        expect((0, environment_1.currentEnvironment)({ override: 'bar' })).toBe('bar');
    });
});
describe('aliasesFor', () => {
    it('reverse lookups', () => {
        expect((0, environment_1.aliasesFor)('foo', { bar: 'foo', baz: 'qux' })).toEqual(['bar']);
        expect((0, environment_1.aliasesFor)('foo', { bar: 'foo', baz: 'foo' })).toEqual(['bar', 'baz']);
    });
});
describe('asEnvOptions', () => {
    it('reads environmentSourceNames string', () => {
        expect((0, environment_1.asEnvOptions)(undefined, undefined, 'foo')).toEqual({
            envVarNames: ['foo'],
            aliases: environment_1.defaultAliases,
        });
    });
    it('reads environmentSourceNames strings', () => {
        expect((0, environment_1.asEnvOptions)(undefined, undefined, ['foo'])).toEqual({
            envVarNames: ['foo'],
            aliases: environment_1.defaultAliases,
        });
    });
});
//# sourceMappingURL=environment.test.js.map