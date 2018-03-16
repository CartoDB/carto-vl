import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/style/expressions/cielab', () => {
    describe('error control', () => {
        validateStaticTypeErrors('cielab', ['float', 'float']);


        validateDynamicTypeErrors('cielab', ['category', 'float', 'float']);
        validateDynamicTypeErrors('cielab', ['float', 'category', 'float']);
        validateDynamicTypeErrors('cielab', ['float', 'float', 'category']);

        validateStaticTypeErrors('cielab', ['float', 'float', 'color']);
        validateStaticTypeErrors('cielab', ['color', 'float', 'float']);
    });

    describe('type', () => {
        validateStaticType('cielab', ['float', 'float', 'float'], 'color');
    });

    describe('eval', () => {
        // TODO
    });
});


