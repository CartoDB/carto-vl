import { validateTypeErrors, validateStaticType, validateMaxArgumentsError } from '../utils';

describe('src/renderer/viz/expressions/cielab', () => {
    describe('error control', () => {
        validateTypeErrors('cielab', ['number', 'number']);

        validateTypeErrors('cielab', ['category', 'number', 'number']);
        validateTypeErrors('cielab', ['number', 'category', 'number']);
        validateTypeErrors('cielab', ['number', 'number', 'category']);

        validateTypeErrors('cielab', ['number', 'number', 'color']);
        validateTypeErrors('cielab', ['color', 'number', 'number']);

        validateMaxArgumentsError('cielab', ['number', 'number', 'number', 'number']);
    });

    describe('type', () => {
        validateStaticType('cielab', ['number', 'number', 'number'], 'color');
    });

    describe('eval', () => {
        // TODO
    });
});
