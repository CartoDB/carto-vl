import { validateStaticType, validateStaticTypeErrors, validateMaxArgumentsError } from './utils';
import { image } from '../../../../../src/renderer/viz/expressions';

describe('src/renderer/viz/expressions/image', () => {
    describe('error control', () => {
        validateStaticTypeErrors('image', [undefined]);
        validateStaticTypeErrors('image', [-4]);
        validateStaticTypeErrors('image', ['number']);
        validateStaticTypeErrors('image', ['color']);
        validateStaticTypeErrors('image', ['category-property']);
        validateStaticTypeErrors('image', ['color-array']);
        validateMaxArgumentsError('image', ['number', 'number']);
    });

    describe('type', () => {
        validateStaticType('image', ['wadus.svg'], 'color');
        it('should include the `isImage` flag', () => {
            expect(image('wadus').isImage).toBe(true);
        });
    });

    describe('eval', () => {
        // TODO
    });
});
