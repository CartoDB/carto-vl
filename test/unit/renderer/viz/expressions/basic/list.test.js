import * as s from '../../../../../../src/renderer/viz/expressions';
import { validateMaxArgumentsError } from '../utils';

describe('src/renderer/viz/expressions/basic/list', () => {
    describe('error control', () => {
        validateMaxArgumentsError('list', ['number', 'number']);
    });

    describe('type', () => {
        // TODO SUPPORTED_CHILD_TYPES
    });

    describe('constructor', () => {
        it('should throw an error when the list is empty ', () => {
            expect(() => s.list()).toThrowError('list(): invalid parameters: must receive at least one argument');
            expect(() => s.list([])).toThrowError('list(): invalid parameters: must receive at least one argument');
        });

        it('should throw an error when the list constains different types ', () => {
            expect(() => s.list([1, 'a'])).toThrowError('list(): invalid second parameter type, invalid argument type combination');
        });
    });

    describe('.value', () => {
        it('should return list of numbers', () => {
            const actual = s.list([1, 2, 3]).value;

            expect(actual).toEqual([1, 2, 3]);
        });

        it('should return list of string', () => {
            const actual = s.list(['a', 'b', 'c']).value;

            expect(actual).toEqual(['a', 'b', 'c']);
        });

        it('should return list of colors', () => {
            const actual = s.list([s.hex('#F00'), s.hex('#00F')]).value;

            expect(actual).toEqual([
                {r: 255, g: 0, b: 0, a: 1},
                {r: 0, g: 0, b: 255, a: 1}]);
        });

        it('should return list of dates', () => {
            const actual = s.list([s.date('2022-03-09T00:00:00Z')]).value;

            expect(actual).toEqual([new Date('2022-03-09T00:00:00Z')]);
        });
    });

    describe('.eval', () => {
        it('should return the float value', () => {
            const actual = s.number(101).eval();

            expect(actual).toEqual(101);
        });
    });
});
