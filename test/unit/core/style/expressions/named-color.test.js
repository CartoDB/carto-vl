import { validateStaticType, validateStaticTypeErrors } from './utils';

describe('src/core/style/expressions/float', () => {
    describe('error control', () => {
        validateStaticTypeErrors('namedColor', [undefined]);
    });

    describe('type', () => {
        validateStaticType('namedColor', ['blue'], 'color');
        validateStaticType('namedColor', ['AliceBlue'], 'color');
        validateStaticType('namedColor', ['BLACK'], 'color');
    });
});


