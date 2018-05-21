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
    describe('clipping', () => {
        const w = new Windshaft(null);
        describe('_intersect()', () => {
            it('should return the intersection point when there is one', () => {
                const r = w._intersect([2, 2], [4, 4], [0, 3], [10, 3]);
                expect(r).toEqual([3, 3]);
            });
            it('should return the intersection point when there is one', () => {
                const r = w._intersect([4, 4], [2, 2], [0, 3], [10, 3]);
                expect(r).toEqual([3, 3]);
            });
            it('should return undefined when there is no intersection because lines are parallel', () => {
                const r = w._intersect([2, 2], [4, 4], [2, 1], [5, 4]);
                expect(r).toEqual(undefined);
            });
            it('should return undefined when there is no intersection because segments don\' intersect', () => {
                const r = w._intersect([2, 2], [4, 4], [0, 3], [2, 3]);
                expect(r).toEqual(undefined);
            });
        });
    });
});
