import * as s from '../../../../../src/core/viz/functions';
import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/viz/expressions/linear', () => {
    describe('error control', () => {
        validateStaticTypeErrors('linear', []);
        validateStaticTypeErrors('linear', ['float']);
        validateStaticTypeErrors('linear', ['float', 'float']);
        validateStaticTypeErrors('linear', ['float', 'color']);
        validateStaticTypeErrors('linear', ['float', 'color', 'float']);
        validateDynamicTypeErrors('linear', ['category', 'float', 'float']);
        validateDynamicTypeErrors('linear', ['float', 'float', 'category']);
    });

    describe('type', () => {
        validateStaticType('linear', ['float', 'float', 'float'], 'float');
    });

    describe('.eval()', () => {
        it('should return value linearly interpolated to min-max range (100%)', () => {
            const actual = s.linear(100, 0, 100).eval();

            expect(actual).toEqual(1);
        });

        it('should return value linearly interpolated to min-max range (10%)', () => {
            const actual = s.linear(100, 0, 1000).eval();

            expect(actual).toEqual(0.1);
        });
    });
});

