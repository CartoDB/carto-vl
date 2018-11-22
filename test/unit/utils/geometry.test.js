import { computeCentroids, triangleArea, GEOMETRY_TYPE } from '../../../src/utils/geometry';

describe('utils/geometry', () => {
    describe('computeCentroids', () => {
        describe('should compute centroid of points', () => {
            const type = GEOMETRY_TYPE.POINT;
            const t1 = [-0.1, 0.0, -0.1, 0.0, -0.1, 0.0]; // x1, y1, x2, y2, x3, y3. Notice x1=x2=x3 and y1=y2=y3 --> no area

            it('should work for one point', () => {
                const oneTrianglePoint = {
                    vertices: t1
                };
                const expectedCentroid = { x: -0.1, y: 0.0 };
                const [calculated] = computeCentroids(oneTrianglePoint, type);

                expect(calculated.x).toBeCloseTo(expectedCentroid.x, 2);
                expect(calculated.y).toBeCloseTo(expectedCentroid.y, 2);
            });
        });
        describe('should compute centroid of polygons', () => {
            const type = GEOMETRY_TYPE.POLYGON;
            const t1 = [0, 0, 10, 0, 5, 10]; // x1, y1, x2, y2, x3, y3
            const t2 = [10, 0, 10, 10, 5, 10];

            it('should work for a polygon with just one triangle', () => {
                const oneTrianglePolygon = {
                    vertices: t1,
                    breakpoints: [6]
                };
                const expectedCentroid = { x: 5, y: 3.333333 };
                const [calculated] = computeCentroids(oneTrianglePolygon, type);

                expect(calculated.x).toBeCloseTo(expectedCentroid.x, 5);
                expect(calculated.y).toBeCloseTo(expectedCentroid.y, 5);
            });

            it('should work for a polygon with several triangles', () => {
                const expectedCentroid = { x: 6.11111, y: 4.44444 };
                const twoTrianglePolygon = {
                    vertices: [...t1, ...t2],
                    breakpoints: [12]
                };
                const [calculated] = computeCentroids(twoTrianglePolygon, type);

                expect(calculated.x).toBeCloseTo(expectedCentroid.x, 5);
                expect(calculated.y).toBeCloseTo(expectedCentroid.y, 5);
            });

            it('should work for n polygons', () => {
                const expectedCentroids = [
                    { x: 5, y: 3.333333 },
                    { x: 8.333333, y: 6.666666 }

                ];
                const twoPolygons = {
                    vertices: [...t1, ...t2],
                    breakpoints: [6, 12]
                };
                const centroids = computeCentroids(twoPolygons, type);

                expect(centroids[0].x).toBeCloseTo(expectedCentroids[0].x, 5);
                expect(centroids[0].y).toBeCloseTo(expectedCentroids[0].y, 5);

                expect(centroids[1].x).toBeCloseTo(expectedCentroids[1].x, 5);
                expect(centroids[1].y).toBeCloseTo(expectedCentroids[1].y, 5);
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
