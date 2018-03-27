import { validateStaticType } from './utils';

describe('src/core/style/expressions/zoom', () => {
    describe('type', () => {
        validateStaticType('zoom', [], 'float');
    });
});
