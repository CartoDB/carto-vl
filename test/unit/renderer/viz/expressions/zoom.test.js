import { validateStaticType } from './utils';

describe('src/renderer/viz/expressions/zoom', () => {
    describe('type', () => {
        validateStaticType('zoom', [], 'number');
    });
});
