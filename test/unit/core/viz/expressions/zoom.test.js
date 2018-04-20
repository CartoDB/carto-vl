import { validateStaticType } from './utils';

describe('src/core/viz/expressions/zoom', () => {
    describe('type', () => {
        validateStaticType('zoom', [], 'number');
    });
});
