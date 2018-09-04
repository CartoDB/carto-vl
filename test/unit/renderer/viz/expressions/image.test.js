import { validateStaticType, validateTypeErrors, validateMaxArgumentsError } from './utils';
import { image } from '../../../../../src/renderer/viz/expressions';

describe('src/renderer/viz/expressions/image', () => {
    describe('error control', () => {
        validateTypeErrors('image', [undefined]);
        validateTypeErrors('image', [-4]);
        validateTypeErrors('image', ['number']);
        validateTypeErrors('image', ['color']);
        validateTypeErrors('image', ['category-property']);
        validateTypeErrors('image', ['color-array']);
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
