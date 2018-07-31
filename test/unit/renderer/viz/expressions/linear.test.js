import * as s from '../../../../../src/renderer/viz/expressions';
import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';
import GlobalMin from '../../../../../src/renderer/viz/expressions/aggregation/global/GlobalMin';
import GlobalMax from '../../../../../src/renderer/viz/expressions/aggregation/global/GlobalMax';

describe('src/renderer/viz/expressions/linear', () => {
    describe('error control', () => {
        validateStaticTypeErrors('linear', []);
        validateStaticTypeErrors('linear', ['number', 'number']);
        validateStaticTypeErrors('linear', ['number', 'color']);
        validateStaticTypeErrors('linear', ['number', 'color', 'number']);
        validateDynamicTypeErrors('linear', ['category', 'number', 'number']);
        validateDynamicTypeErrors('linear', ['number', 'number', 'category']);
    });

    describe('type', () => {
        validateStaticType('linear', ['number'], 'number');
        validateStaticType('linear', ['number', 'number', 'number'], 'number');
    });

    describe('min/max', () => {
        it('should default to globalMin(input) and globalMax(input)', () => {
            const l = s.linear(s.prop('wadus'));
            expect(l.min).toEqual(jasmine.any(GlobalMin));
            expect(l.max).toEqual(jasmine.any(GlobalMax));
            expect(l.min.property.name).toEqual('wadus');
            expect(l.max.property.name).toEqual('wadus');
        });
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

    describe('regression', () => {
        it('should eval correctly with date properties', () => {
            const l = s.linear(s.prop('wadus'), s.time('1880-01-01T00:00:07Z'), s.time('1880-01-01T00:00:09Z'));
            l._bindMetadata({
                properties: {
                    wadus: {
                        type: 'date',
                        min: new Date('1880-01-01T00:00:07Z'),
                        max: new Date('1880-01-01T00:00:09Z')
                    }
                }
            });
            expect(l.eval({
                wadus: 0.5
            })).toEqual(0.5);
        });
    });
});
