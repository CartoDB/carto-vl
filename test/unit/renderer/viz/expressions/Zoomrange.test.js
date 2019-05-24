import * as s from '../../../../../src/renderer/viz/expressions';
import { validateStaticType, validateTypeErrors } from './utils';
import Metadata from '../../../../../src/renderer/Metadata';

describe('src/renderer/viz/expressions/zoomrange', () => {
    describe('type', () => {
        validateStaticType('zoomrange', [[7, 10]], 'number');
    });

    describe('error control', () => {
        validateTypeErrors('zoomrange', []);
        validateTypeErrors('zoomrange', [0]);
    });

    describe('.value', () => {
        it('should return the range array', () => {
            const actual = s.zoomrange([1, 10, 15, 20]).value;
            expect(actual).toEqual([1, 10, 15, 20]);
        });
    });

    describe('eval', () => {
        const metadata = new Metadata({
            properties: {
                price: {
                    type: 'number',
                    min: 0,
                    max: 10
                }
            },
            sample: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        });

        const fakeFeature = {
            price: 5
        };

        it('should evaluate the feature', () => {
            const ramp = s.ramp(s.zoomrange([7, 10]), [1, 20]);
            ramp._bindMetadata(metadata);
            const actual = ramp.eval(fakeFeature);
            expect(actual).toEqual(1);
        });
    });
});
