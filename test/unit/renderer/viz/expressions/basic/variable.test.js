import { validateStaticTypeErrors, validateMaxArgumentsError } from '../utils';

describe('src/renderer/viz/expressions/basic/variable', () => {
    describe('error control', () => {
        validateStaticTypeErrors('variable', []);
        validateStaticTypeErrors('variable', [undefined]);
        validateStaticTypeErrors('variable', [123]);
        validateStaticTypeErrors('variable', ['number']);
        validateMaxArgumentsError('variable', ['number', 'number']);
    });
});
