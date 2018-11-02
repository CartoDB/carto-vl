import { validateStaticType, validateMaxArgumentsError, validateTypeErrors } from './utils';
import { alphaNormalize, rgb, property } from '../../../../../src/renderer/viz/expressions';
import { mockMetadata } from './utils';

describe('src/renderer/viz/expressions/AlphaNormalize', () => {
    describe('type', () => {
        validateStaticType('alphaNormalize', ['color', 'number-property'], 'color');
    });
    describe('error control', () => {
        validateMaxArgumentsError('alphaNormalize', ['color', 'number', 'number']);
        validateTypeErrors('alphaNormalize', []);
        validateTypeErrors('alphaNormalize', ['color']);
        validateTypeErrors('alphaNormalize', ['color', 'category']);
    });
    describe('eval', () => {
        it('should return a normalized color', () => {
            const expr = alphaNormalize(rgb(255, 128, 0), property('price'));
            expr._bindMetadata(
                mockMetadata({
                    properties: {
                        price: {
                            type: 'number',
                            max: 10
                        }
                    }
                })
            );
            expect(expr.eval({ price: 5 })).toEqual({ r: 255, g: 128, b: 0, a: 0.5 });
        });
    });
});
