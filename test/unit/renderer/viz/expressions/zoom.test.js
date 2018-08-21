import { validateStaticType, validateMaxArgumentsError } from './utils';

describe('src/renderer/viz/expressions/zoom', () => {
    describe('type', () => {
        validateStaticType('zoom', [], 'number');
        validateMaxArgumentsError('zoom', ['number']);
    });
});
