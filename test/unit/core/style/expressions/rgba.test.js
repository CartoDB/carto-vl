import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/style/expressions/rgba', () => {
    describe('error control', () => {
        validateStaticTypeErrors('rgba', []);
        validateStaticTypeErrors('rgba', ['float', 'float', 'float']);
        validateDynamicTypeErrors('rgba', ['float', 'float', 'category', 'float']);
    });

    describe('type', () => {
        validateStaticType('rgba', ['float', 'float', 'float', 'float'], 'color');
    });

    describe('eval', () => {
        // TODO
    });
});


