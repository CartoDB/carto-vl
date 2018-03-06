import * as s from '../../../../../src/core/style/functions';

describe('src/core/style/expressions/betewwn', () => {
    describe('between', () => {
        test(9, 0);
        test(10, 1);
        test(15, 1);
        test(20, 1);
        test(21, 0);
    });

    function test(price, expected) {
        it(`between($price, 10, 20) should return 0 when $price is ${price}`, () => {
            const fakeFeature = { price };
            const $price = s.property('price');
            const actual = s.between($price, 10, 20).eval(fakeFeature);

            expect(actual).toEqual(expected);
        });
    }
});


