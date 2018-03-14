import * as s from '../../../../../src/core/style/functions';
import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/style/expressions/between', () => {
    describe('error control', () => {
        validateDynamicTypeErrors('between', ['category', 'float', 'float']);
        validateDynamicTypeErrors('between', ['float', 'category', 'float']);
        validateDynamicTypeErrors('between', ['float', 'float', 'category']);
        validateStaticTypeErrors('between', ['float', 'float', 'color']);
        validateStaticTypeErrors('between', ['color', 'float', 'color']);
    });

    describe('type', () => {
        validateStaticType('between', ['float', 'float', 'float'], 'float');
    });

    describe('eval', () => {
        testEval(9, 0);
        testEval(10, 1);
        testEval(15, 1);
        testEval(20, 1);
        testEval(21, 0);
    });

    function testEval(price, expected) {
        it(`between($price, 10, 20) should return 0 when $price is ${price}`, () => {
            const fakeFeature = { price };
            const $price = s.property('price');
            const actual = s.between($price, 10, 20).eval(fakeFeature);

            expect(actual).toEqual(expected);
        });
    }
});


