"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
describe('camelToScreamingCase', () => {
    it('converts a typical camel case name', () => {
        expect((0, common_1.camelToScreamingCase)('fooBar')).toBe('FOO_BAR');
        expect((0, common_1.camelToScreamingCase)('fooBarBaz')).toBe('FOO_BAR_BAZ');
    });
    it('converts a pascal case name', () => {
        expect((0, common_1.camelToScreamingCase)('FooBar')).toBe('FOO_BAR');
    });
    it('uses numbers as delimiters', () => {
        expect((0, common_1.camelToScreamingCase)('foo2Bar')).toBe('FOO_2_BAR');
        expect((0, common_1.camelToScreamingCase)('foo22Bar')).toBe('FOO_22_BAR');
        expect((0, common_1.camelToScreamingCase)('foo2Bar4')).toBe('FOO_2_BAR_4');
        expect((0, common_1.camelToScreamingCase)('foo22Bar44')).toBe('FOO_22_BAR_44');
        expect((0, common_1.camelToScreamingCase)('22Bar')).toBe('22_BAR');
        expect((0, common_1.camelToScreamingCase)('22Bar44')).toBe('22_BAR_44');
        expect((0, common_1.camelToScreamingCase)('Foo1B')).toBe('FOO_1B');
        expect((0, common_1.camelToScreamingCase)('Foo1BC')).toBe('FOO_1BC');
    });
    it('converts dashes where present', () => {
        expect((0, common_1.camelToScreamingCase)('foo-bar')).toBe('FOO_BAR');
    });
    it('keeps screaming case in-tact', () => {
        expect((0, common_1.camelToScreamingCase)('FOO_BAR')).toBe('FOO_BAR');
    });
    it('allows using different delimiters', () => {
        expect((0, common_1.camelToScreamingCase)('fooBarBaz', '-')).toBe('FOO-BAR-BAZ');
    });
});
describe('flattenObjectTree', () => {
    const person = {
        name: 'bob',
        favouriteFood: 'cheese',
        bestFriend: {
            name: 'steve',
            favouriteFood: 'pizza',
        },
    };
    const restaurant = {
        foods: ['pasta', 'pizza', 'taco', 'salad'],
    };
    const zoo = {
        giraffe: {
            name: 'Gerald',
            legCount: 4,
        },
        elephant: {
            name: 'Steve',
            legCount: 4,
        },
        lion: {
            name: 'Fredrick',
            legCount: 4,
        },
        penguin: {
            name: 'Todd',
            legCount: 2,
        },
        stegosaurus: null,
        // cast because undefined isn't actually possible in JsonObject
        unicorn: undefined,
    };
    it('flattens a basic object', () => {
        const flattenedObject = (0, common_1.flattenObjectTree)(person);
        expect(flattenedObject).toEqual({
            NAME: 'bob',
            FAVOURITE_FOOD: 'cheese',
            BEST_FRIEND_NAME: 'steve',
            BEST_FRIEND_FAVOURITE_FOOD: 'pizza',
        });
    });
    it('uses provided separator', () => {
        const flattenedObject = (0, common_1.flattenObjectTree)(person, '', '-');
        const keys = Object.keys(flattenedObject);
        expect(keys).toContain('NAME');
        expect(keys).toContain('FAVOURITE-FOOD');
        expect(keys).toContain('BEST-FRIEND-NAME');
        expect(keys).toContain('BEST-FRIEND-FAVOURITE-FOOD');
    });
    it('formats arrays with index in variable names', () => {
        const flattenedObject = (0, common_1.flattenObjectTree)(restaurant);
        expect(flattenedObject).toEqual({
            FOODS_0: 'pasta',
            FOODS_1: 'pizza',
            FOODS_2: 'taco',
            FOODS_3: 'salad',
        });
    });
    it('appends prefix to variable names', () => {
        const flattenedObject = (0, common_1.flattenObjectTree)(person, 'APP_CONFIG');
        const keys = Object.keys(flattenedObject);
        expect(keys).toContain('APP_CONFIG_NAME');
        expect(keys).toContain('APP_CONFIG_FAVOURITE_FOOD');
        expect(keys).toContain('APP_CONFIG_BEST_FRIEND_NAME');
        expect(keys).toContain('APP_CONFIG_BEST_FRIEND_FAVOURITE_FOOD');
    });
    it('uses a custom key formatter', () => {
        const stripVowels = (key) => {
            return key.replace(/[aeiou]/gi, '').toLowerCase();
        };
        const flattenedObject = (0, common_1.flattenObjectTree)(person, '', '_', stripVowels);
        const keys = Object.keys(flattenedObject);
        expect(keys).toContain('nm');
        expect(keys).toContain('fvrtfd');
        expect(keys).toContain('bstfrnd_nm');
        expect(keys).toContain('bstfrnd_fvrtfd');
    });
    it('passes null values through to object', () => {
        const flattenedObject = (0, common_1.flattenObjectTree)(zoo);
        expect(flattenedObject).toMatchObject({
            STEGOSAURUS: null,
        });
    });
    it('passes undefined values through to object', () => {
        const flattenedObject = (0, common_1.flattenObjectTree)(zoo);
        expect(flattenedObject).toMatchObject({
            UNICORN: undefined,
        });
    });
});
describe('renameInFlattenedTree', () => {
    it('renames a property name', () => {
        expect((0, common_1.renameInFlattenedTree)({ FOO: 'value', BAZ: '42' }, ['FOO=BAR'])).toEqual({
            BAR: 'value',
            BAZ: '42',
        });
    });
});
//# sourceMappingURL=common.test.js.map