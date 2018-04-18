import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/viz/expressions/cielab', () => {
    describe('error control', () => {
        validateStaticTypeErrors('cielab', ['number', 'number']);


        validateDynamicTypeErrors('cielab', ['category', 'number', 'number']);
        validateDynamicTypeErrors('cielab', ['number', 'category', 'number']);
        validateDynamicTypeErrors('cielab', ['number', 'number', 'category']);

        validateStaticTypeErrors('cielab', ['number', 'number', 'color']);
        validateStaticTypeErrors('cielab', ['color', 'number', 'number']);
    });

    describe('type', () => {
        validateStaticType('cielab', ['number', 'number', 'number'], 'color');
    });

    describe('eval', () => {
        // TODO
    });
});


