import { validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/style/expressions/float', () => {
    describe('error control', () => {
        validateStaticTypeErrors('color', [undefined]);
    });

    describe('type', () => {
        validateStaticType('color', ['blue'], 'color');
        validateStaticType('color', ['AliceBlue'], 'color');
        validateStaticType('color', ['BLACK'], 'color');

    });
});


