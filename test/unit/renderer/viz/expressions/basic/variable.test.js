import { validateTypeErrors, validateMaxArgumentsError } from '../utils';

describe('src/renderer/viz/expressions/basic/variable', () => {
    describe('error control', () => {
        validateTypeErrors('variable', []);
        validateTypeErrors('variable', [undefined]);
        validateTypeErrors('variable', [123]);
        validateTypeErrors('variable', ['number']);
        validateMaxArgumentsError('variable', ['number', 'number']);
    });
});
