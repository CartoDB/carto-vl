import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/style/expressions/rgb', () => {
    describe('error control', () => {
        validateStaticTypeErrors('rgba', []);
        validateStaticTypeErrors('rgba', ['float', 'float', 'float']);
        validateDynamicTypeErrors('rgba', ['float', 'float', 'category', 'float']);

        validateStaticTypeErrors('rgb', []);
        validateStaticTypeErrors('rgb', ['float', 'float']);
        validateDynamicTypeErrors('rgb', ['float', 'float', 'category']);
    });

    describe('type', () => {
        validateStaticType('rgb', ['float', 'float', 'float'], 'color');
        validateStaticType('rgba', ['float', 'float', 'float', 'float'], 'color');
    });

    describe('eval', () => {
        //  TODO 
    });
});
