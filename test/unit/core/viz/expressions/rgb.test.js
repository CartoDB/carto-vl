import { validateDynamicTypeErrors, validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/viz/expressions/rgb', () => {
    describe('error control', () => {
        validateStaticTypeErrors('rgba', []);
        validateStaticTypeErrors('rgba', ['number', 'number', 'number']);
        validateDynamicTypeErrors('rgba', ['number', 'number', 'string', 'number']);

        validateStaticTypeErrors('rgb', []);
        validateStaticTypeErrors('rgb', ['number', 'number']);
        validateDynamicTypeErrors('rgb', ['number', 'number', 'string']);
    });

    describe('type', () => {
        validateStaticType('rgb', ['number', 'number', 'number'], 'color');
        validateStaticType('rgba', ['number', 'number', 'number', 'number'], 'color');
    });

    describe('eval', () => {
        //  TODO
    });
});
