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
    fdescribe('clipping', () => {
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
        describe('_clipSegment(a, b)', () => {
            it('should return \'b\' when the segment doesn\' intersect the tile and it\'s inside it', () => {
                const a = [.5, .5];
                const b = [.9, .9];
                const r = w._clipSegment(a, b);
                expect(r).toEqual(b);
            });
            it('should return \'b\' when the segment doesn\' intersect the tile and it\'s outside it', () => {
                const a = [1.9, 1.9];
                const b = [1.1, 1.1];
                const r = w._clipSegment(a, b);
                expect(r).toEqual(b);
            });
            it('should return the intersection point when AB intersects the tile, and A is outside the tile', () => {
                const a = [1.9, 1.9];
                const b = [0.1, 0.1];
                const r = w._clipSegment(a, b);
                expect(r).toEqual([1, 1]);
            });
            it('should return the intersection point when AB intersects the tile, and B is outside the tile', () => {
                const a = [0.1, 0.1];
                const b = [1.9, 1.9];
                const r = w._clipSegment(a, b).map(x => Math.round(x * 1000) / 1000);
                expect(r).toEqual([1, 1]);
            });
        });
    });
});
