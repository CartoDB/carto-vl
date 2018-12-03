import { triangleCollides } from '../../../src/utils/collision';

describe('utils/collision/', () => {
    describe('triangleCollides', () => {
        const aabb = { minx: 0, miny: 0, maxx: 1, maxy: 1 };
        it('should return false when the triangle is far away from the AABB', () => {
            expect(triangleCollides([{ x: 10, y: 10 }, { x: 11, y: 10 }, { x: 10, y: 11 }], aabb)).toEqual(false);
        });
        it('should return false when the triangle is outside and the AABB sides don\'t separate the triangle vertices', () => {
            expect(triangleCollides([{ x: -1, y: -1 }, { x: 0.9, y: -1 }, { x: -1, y: 0.9 }], aabb)).toEqual(false);
        });
        it('should return false when the triangle is completely inside the AABB', () => {
            expect(triangleCollides([{ x: 0.1, y: 0.1 }, { x: 0.2, y: 0.1 }, { x: 0.1, y: 0.2 }], aabb)).toEqual(true);
        });
        it('should return false when the triangle is partially inside the AABB', () => {
            expect(triangleCollides([{ x: -0.1, y: -0.1 }, { x: 0.2, y: -0.1 }, { x: -0.1, y: 0.2 }], aabb)).toEqual(true);
        });

        describe('triangle from line', () => {
            it('should return true when it intersects the AABB', () => {
                expect(triangleCollides([{ x: 0, y: -6 }, { x: 0, y: -6 }, { x: 0, y: 8 }], aabb)).toEqual(true);
            });
            it('should return false when it doesn\'t intersect the AABB', () => {
                expect(triangleCollides([{ x: 10, y: -6 }, { x: 10, y: -6 }, { x: 10, y: 8 }], aabb)).toEqual(false);
            });
            it('should return true when it is partially inside the AABB', () => {
                expect(triangleCollides([{ x: 0, y: 0.5 }, { x: 0, y: 0.5 }, { x: 0, y: 2 }], aabb)).toEqual(true);
            });
            it('should return true when it is completely inside the AABB', () => {
                expect(triangleCollides([{ x: 0, y: 0.5 }, { x: 0, y: 0.5 }, { x: 0, y: 0.6 }], aabb)).toEqual(true);
            });
        });
    });
});
