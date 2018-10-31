import { computeCentroids, triangleArea } from '../../../src/utils/geometry';

describe('utils/geometry', () => {
    describe('computeCentroids', () => {
        describe('compute centroid of a polygon', () => {
            const type = 'polygon';
            const t1 = [0, 0, 10, 0, 5, 10]; // x1, y1, x2, y2, x3, y3
            const t2 = [10, 0, 10, 10, 5, 10];

            it('should work for one triangle polygon', () => {
                const oneTrianglePolygon = {
                    vertices: t1,
                    breakpoints: [6]
                };
                const expectedCentroid = { x: 5, y: 3.333333 };
                const [calculated] = computeCentroids(oneTrianglePolygon, type);

                expect(calculated.x).toBeCloseTo(expectedCentroid.x, 5);
                expect(calculated.y).toBeCloseTo(expectedCentroid.y, 5);
            });

            it('should work for several triangles', () => {
                const expectedCentroid = { x: 6.11111, y: 4.44444 };
                const twoTrianglePolygon = {
                    vertices: [...t1, ...t2],
                    breakpoints: [12]
                };
                const [calculated] = computeCentroids(twoTrianglePolygon, type);

                expect(calculated.x).toBeCloseTo(expectedCentroid.x, 5);
                expect(calculated.y).toBeCloseTo(expectedCentroid.y, 5);
            });
        });
    });

    describe('triangle area', () => {
        it('should calculate the area for one triangle', () => {
            const triangle = [[0, 0], [10, 0], [5, 10]];
            const calculated = triangleArea(triangle);
            expect(calculated).toBe(50);
        });
    });
});
