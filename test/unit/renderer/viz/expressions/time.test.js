import Time from '../../../../../src/renderer/viz/expressions/time';
import { validateMaxArgumentsError, validateTypeErrors } from './utils';

describe('src/renderer/viz/expressions/time', () => {
    describe('error control', () => {
        validateMaxArgumentsError('time', ['date', 'date']);
        validateTypeErrors('time', [null]);
        validateTypeErrors('time', ['number']);
        validateTypeErrors('time', ['category']);
        validateTypeErrors('time', []);
    });

    const expectedDate = new Date('2016-05-30T13:45:00+05:00');
    it('should return a valid date when the parameter is a ISO_8601 string', () => {
        const time = new Time('2016-05-30T13:45:00+05:00');
        const actual = time.eval();
        expect(actual).toEqual(expectedDate);
    });

    it('should return a valid date when the parameter is a number containing a MILLISECONDS Unix Time', () => {
        const time = new Time(1464597900000);
        const actual = time.eval();
        expect(actual).toEqual(expectedDate);
    });

    it('should return a valid date when the parameter is a javascript Date object', () => {
        const time = new Time(expectedDate);
        const actual = time.eval();
        expect(actual).toEqual(expectedDate);
    });
});
