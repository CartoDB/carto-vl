import { validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/style/expressions/hex', () => {
    describe('error control', () => {
        validateStaticTypeErrors('hex', []);
        validateStaticTypeErrors('hex', ['float']);
        validateStaticTypeErrors('hex', ['category']);
        validateStaticTypeErrors('hex', ['#Z08080']);
    });

    describe('type', () => {
        validateStaticType('hex', ['#808080'], 'color');
    });

    describe('eval', () => {
        // TODO
    });
});


