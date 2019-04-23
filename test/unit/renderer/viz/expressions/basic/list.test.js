import * as s from '../../../../../../src/renderer/viz/expressions';
import { validateMaxArgumentsError, validateTypeErrors } from '../utils';
import { CartoValidationTypes as cvt } from '../../../../../../src/errors/carto-validation-error';

describe('src/renderer/viz/expressions/basic/list', () => {
    describe('error control', () => {
        validateMaxArgumentsError('list', ['number', 'number']);
        validateTypeErrors('list', [], () => `${cvt.MISSING_REQUIRED} list(): invalid parameters: must receive at least one argument.`);
        validateTypeErrors('list', [[]], () => `${cvt.MISSING_REQUIRED} list(): invalid parameters: must receive at least one argument.`);
        validateTypeErrors('list', [[1, 'a']]);
        validateTypeErrors('list', [[function () { }]]);
    });

    describe('.value', () => {
        it('should return list of numbers', () => {
            const list = s.list([1, 2, 3]);

            list._bindMetadata({});
            const actual = list.value;

            expect(actual).toEqual([1, 2, 3]);
        });

        it('should return list of string', () => {
            const list = s.list(['a', 'b', 'c']);

            list._bindMetadata({});
            const actual = list.value;

            expect(actual).toEqual(['a', 'b', 'c']);
        });

        it('should return list of colors', () => {
            const list = s.list([s.hex('#F00'), s.hex('#00F')]);

            list._bindMetadata({});
            const actual = list.value;

            expect(actual).toEqual([
                { r: 255, g: 0, b: 0, a: 1 },
                { r: 0, g: 0, b: 255, a: 1 }]);
        });

        it('should return list of dates', () => {
            const list = s.list([s.date('2022-03-09T00:00:00Z')]);

            list._bindMetadata({});
            const actual = list.value;

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
