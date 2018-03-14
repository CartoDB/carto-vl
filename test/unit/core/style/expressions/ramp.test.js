import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/style/expressions/ramp', () => {
    describe('error control', () => {
        validateStaticTypeErrors('ramp', []);
        validateStaticTypeErrors('ramp', ['float']);
        validateDynamicTypeErrors('ramp', ['category', 'palette']);
    });

    describe('type', () => {
        validateStaticType('ramp', ['float', 'palette'], 'color');
    });

    describe('eval', () => {
        // TODO
    });
});


