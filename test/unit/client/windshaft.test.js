import Windshaft from '../../../src/client/windshaft';

describe('src/client/windshaft', () => {
    describe('_categorizeString', () => {
        it('should add categories', () => {
            const w = new Windshaft(null);
            w._categorizeString('cat1', false);
            w._categorizeString('cat2', false);
            expect(w._categorizeString('cat1')).toEqual(0);
            expect(w._categorizeString('cat2')).toEqual(1);
        });
        it('should manage null categories', () => {
            const w = new Windshaft(null);
            w._categorizeString('cat1', false);
            w._categorizeString('cat2', false);
            w._categorizeString('null', false);
            expect(w._categorizeString(undefined)).toEqual(2);
        });
    });
});
