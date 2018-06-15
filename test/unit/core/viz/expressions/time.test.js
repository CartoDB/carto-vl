import * as s from '../../../../../src/core/viz/functions';

describe('src/core/viz/expressions/time', () => {
    describe('time', () => {
        const date = new Date('2016-05-30T13:45:00+05:00');
        test('time', '2016-05-30T13:45:00+05:00', date);
        test('time', 1464597900, date);
        test('time', date, date);
    });

    function test(fn, param1, expected) {
        it(`${fn}(${param1}) should return ${expected}`, () => {
            let actual = s[fn](param1).eval();
            expect(actual).toEqual(expected);
            actual = s[fn](param1).value;
            expect(actual).toEqual(expected);
        });
    }

});
