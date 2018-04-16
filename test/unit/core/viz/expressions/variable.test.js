import { validateStaticTypeErrors } from './utils';

describe('src/core/viz/expressions/variable', () => {
    describe('error control', () => {
        validateStaticTypeErrors('variable', []);
        validateStaticTypeErrors('variable', [undefined]);
        validateStaticTypeErrors('variable', [123]);
        validateStaticTypeErrors('variable', ['float']);
    });
});

