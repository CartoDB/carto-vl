import Windshaft from '../../../src/client/windshaft';

describe('src/client/windshaft', () => {
    describe('_getCategoryIDFromString', () => {
        it('should add categories', () => {
            const w = new Windshaft(null);
            w._getCategoryIDFromString('cat1', false);
            w._getCategoryIDFromString('cat2', false);
            expect(w._getCategoryIDFromString('cat1')).toEqual(0);
            expect(w._getCategoryIDFromString('cat2')).toEqual(1);
        });
        it('should manage null categories', () => {
            const w = new Windshaft(null);
            w._getCategoryIDFromString('cat1', false);
            w._getCategoryIDFromString('cat2', false);
            w._getCategoryIDFromString('null', false);
            expect(w._getCategoryIDFromString(undefined)).toEqual(2);
        });
    });
});
