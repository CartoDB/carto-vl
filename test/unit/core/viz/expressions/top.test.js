import { validateTypeErrors, validateStaticType, validateFeatureDependentErrors } from './utils';

describe('src/core/viz/expressions/top', () => {
    describe('error control', () => {
        validateFeatureDependentErrors('top', ['category-property', 'dependent']);
        validateTypeErrors('top', ['number', 10]);
        validateTypeErrors('top', ['color', 10]);
    });
    describe('type', () => {
        validateStaticType('top', ['category-property', 5], 'category');
    });
});
