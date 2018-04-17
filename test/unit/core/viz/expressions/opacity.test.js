import { validateStaticType, validateStaticTypeErrors, validateDynamicTypeErrors } from './utils';
import { opacity, rgba } from '../../../../../src/core/viz/functions';

describe('src/core/viz/expressions/opacity', () => {
    describe('error control', () => {
        validateStaticTypeErrors('opacity', []);
        validateStaticTypeErrors('opacity', ['float']);
        validateDynamicTypeErrors('opacity', ['float', 'float']);
        validateDynamicTypeErrors('opacity', ['color', 'category']);
    });

    describe('type', () => {
        validateStaticType('opacity', ['color', 'float'], 'color');
    });

    describe('eval', () => {
        it('should override the alpha channel', () => {
            expect(opacity(rgba(255, 255, 255, 0.5), 0.7).eval()).toEqual({ r: 255, g: 255, b: 255, a: 0.7 });
        });
    });
});


