import * as s from '../../../../../src/core/style/functions';
import { validateStaticTypeErrors } from './utils';

describe('src/core/style/expressions/property', () => {
    describe('error control', () => {
        validateStaticTypeErrors('property', []);
        validateStaticTypeErrors('property', [undefined]);
        validateStaticTypeErrors('property', [123]);
        validateStaticTypeErrors('property', ['float']);
    });

    describe('.eval()', () => {
        it('should return the value from the feature', () => {
            const fakeFeature = {
                property0: 'foo',
                property1: 'bar',
            };

            const $property0 = s.property('property0');
            expect($property0.eval(fakeFeature)).toEqual('foo');

            const $property1 = s.property('property1');
            expect($property1.eval(fakeFeature)).toEqual('bar');
        });
    });
});

