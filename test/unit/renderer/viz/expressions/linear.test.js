import * as s from '../../../../../src/renderer/viz/expressions';
import { validateTypeErrors, validateStaticType, validateMaxArgumentsError } from './utils';
import GlobalMin from '../../../../../src/renderer/viz/expressions/aggregation/global/GlobalMin';
import GlobalMax from '../../../../../src/renderer/viz/expressions/aggregation/global/GlobalMax';
import { mockMetadata } from './utils';
import WindshaftDateCodec from '../../../../../src/codecs/windshaft/WindshaftDate';

describe('src/renderer/viz/expressions/linear', () => {
    describe('error control', () => {
        validateTypeErrors('linear', []);
        validateTypeErrors('linear', ['number', 'number']);
        validateTypeErrors('linear', ['number', 'color']);
        validateTypeErrors('linear', ['number', 'color', 'number']);
        validateTypeErrors('linear', ['category', 'number', 'number']);
        validateTypeErrors('linear', ['number', 'number', 'category']);
        validateMaxArgumentsError('linear', ['number', 'number', 'number', 'number', 'number']);
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
        it('should default to globalMin(input) and globalMax(input) for cluster aggr.', () => {
            const l = s.linear(s.clusterAvg(s.prop('wadus')));
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
            l._bindMetadata(
                mockMetadata({
                    properties: {
                        wadus: {
                            type: 'date',
                            min: new Date('1880-01-01T00:00:07Z'),
                            max: new Date('1880-01-01T00:00:09Z')
                        }
                    }
                })
            );
            expect(l.eval({
                wadus: 0.5
            })).toEqual(1420070396.50025);
        });

        it('should eval feature correctly when using a date property with a WindshaftDateCodec...', () => {
            const property = s.prop('wadus');
            const [min, max] = [s.time('2016-05-01T00:00:07Z'), s.time('2016-05-06T10:40:59Z')];
            const l = s.linear(property, min, max);
            const metadata = mockMetadata({
                properties: {
                    wadus: {
                        type: 'date',
                        min: 1462060807, // Sun May 01 2016 00:00:07 UTC
                        max: 1462531259 // Fri May 06 2016 10:40:59 UTC
                    }
                }
            });
            l._bindMetadata(metadata);
            metadata.codec = () => new WindshaftDateCodec(metadata, 'wadus');

            expect(l.eval({ wadus: new Date('2016-05-01T00:00:07Z') })).toEqual(0);
            expect(l.eval({ wadus: new Date('2016-05-06T10:40:59Z') })).toEqual(1);
        });
    });
});
