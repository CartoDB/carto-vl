import Dataframe from '../../../src/renderer/Dataframe';
import Metadata from '../../../src/renderer/Metadata';
import { pointInTriangle, GEOMETRY_TYPE } from '../../../src/utils/geometry';
import { mat4 } from 'gl-matrix';

describe('src/renderer/Dataframe', () => {
    const m = [];
    mat4.identity(m);
    mat4.scale(m, m, [2, 1, 1]);
    mat4.translate(m, m, [-0.5, 0, 0]);

    const m2 = [];
    mat4.ortho(m2, -1, 1, 1, 0, 0, 1);
    mat4.multiply(m, m2, m);

    describe('.getFeaturesAtPosition', () => {
        describe('when dataframe is point type', () => {
            const dataframe = new Dataframe({
                center: { x: 0, y: 0 },
                scale: 1,
                geom: new Float32Array([
                    0, 0,
                    0, 0,
                    0, 0,

                    1, 1,
                    1, 1,
                    1, 1
                ]),
                properties: {
                    id: [1, 2]
                },
                type: GEOMETRY_TYPE.POINT,
                size: 2,
                active: true,
                metadata: new Metadata({
                    properties: {
                        id: {
                            type: 'number'
                        }
                    },
                    idProperty: 'id'
                })
            });
            const feature1 = { id: 1 };
            const feature2 = { id: 2 };
            const viz = {
                width: { eval: () => 0.5 },
                strokeWidth: { eval: () => 0.5 },
                filter: { eval: () => 1.0 },
                symbol: { default: true },
                transform: { default: true }
            };
            dataframe.renderer = { _zoom: 1, gl: { canvas: { width: 1024 * window.devicePixelRatio, height: 1024 * window.devicePixelRatio } } };
            dataframe.matrix = m;

            it('should return an empty list when there are no points at the given position', () => {
                expect(dataframe.getFeaturesAtPosition({ x: 512, y: 512 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 5000, y: 5000 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 1024, y: 1023.4 }, viz)).toEqual([]);
            });

            it('should return a list containing the features at the given position', () => {
                expectEqualFeatures(dataframe.getFeaturesAtPosition({ x: 0, y: 0 }, viz), [feature1]);
                expectEqualFeatures(dataframe.getFeaturesAtPosition({ x: 1024, y: 1024 }, viz), [feature2]);
                expectEqualFeatures(dataframe.getFeaturesAtPosition({ x: 1024, y: 1023.6 }, viz), [feature2]);
            });

            describe('and symbols are active', () => {
                const viz = {
                    width: { eval: () => 10.5 },
                    strokeWidth: { eval: () => 0.5 },
                    filter: { eval: () => 1.0 },
                    symbol: { default: false },
                    symbolPlacement: { eval: () => [1, 1] },
                    transform: { default: true }
                };
                it('should return an empty list when there are no points at the given position', () => {
                    expect(dataframe.getFeaturesAtPosition({ x: 512, y: 512 }, viz)).toEqual([]);
                    expect(dataframe.getFeaturesAtPosition({ x: 5000, y: 5000 }, viz)).toEqual([]);
                    expect(dataframe.getFeaturesAtPosition({ x: 1024 + 5.25, y: 1023.4 - 10.5 }, viz)).toEqual([]);
                });

                it('should return a list containing the features at the given position', () => {
                    expectEqualFeatures(dataframe.getFeaturesAtPosition({ x: 5, y: -10.4 }, viz), [feature1]);
                    expectEqualFeatures(dataframe.getFeaturesAtPosition({ x: 1024 + 5.25, y: 1024 - 10.5 }, viz), [feature2]);
                    expectEqualFeatures(dataframe.getFeaturesAtPosition({ x: 1024 + 5.25, y: 1023.6 - 10.5 }, viz), [feature2]);
                });
            });

            it('should return zero features when the filter is not passed', () => {
                const viz = {
                    width: { eval: () => 0.5 },
                    strokeWidth: { eval: () => 0.5 },
                    filter: { eval: () => 0.0 },
                    transform: { default: true }
                };
                expect(dataframe.getFeaturesAtPosition({ x: 0, y: 0 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 1024, y: 1024 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 1024, y: 1023.6 }, viz)).toEqual([]);
            });
        });

        describe('when dataframe is line type', () => {
            const segment = [
                0, 0,
                9, 0
            ];
            const dataframe = new Dataframe({
                center: { x: 0, y: 0 },
                scale: 1,
                geom: [[segment]],
                properties: {
                    numeric_prop: [1],
                    cartodb_id: [0]
                },
                type: GEOMETRY_TYPE.LINE,
                size: 1,
                active: true,
                metadata: new Metadata({
                    properties: {
                        numeric_prop: {
                            type: 'number'
                        },
                        cartodb_id: {
                            type: 'number'
                        }
                    },
                    idProperty: 'cartodb_id'
                })
            });
            const feature1 = {
                numeric_prop: 1,
                cartodb_id: 0
            };
            const viz = {
                width: { eval: () => 1 },
                filter: { eval: () => 1.0 },
                transform: { default: true }
            };

            dataframe.matrix = m;
            dataframe.renderer = { _zoom: 1, gl: { canvas: { width: 1024 * window.devicePixelRatio, height: 1024 * window.devicePixelRatio } }, drawMetadata: { zoomLevel: 0 } };

            it('should return an empty list when there are no lines at the given position', () => {
                expect(dataframe.getFeaturesAtPosition({ x: 5 * 1024, y: 1.001 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 5 * 1024, y: -1.001 }, viz)).toEqual([]);
            });

            it('should return a list containing the features at the given position', () => {
                expectEqualFeatures(dataframe.getFeaturesAtPosition({ x: 5 * 1024, y: 0.999 }, viz), [feature1]);
                expectEqualFeatures(dataframe.getFeaturesAtPosition({ x: 5 * 1024, y: -0.999 }, viz), [feature1]);
            });

            it('should return zero features when the filter is not passed', () => {
                const viz = {
                    width: { eval: () => 1 },
                    filter: { eval: () => 0.0 },
                    transform: { default: true }
                };
                expect(dataframe.getFeaturesAtPosition({ x: 5 * 1024, y: 0.999 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 5 * 1024, y: -0.999 }, viz)).toEqual([]);
            });
        });

        describe('when dataframe is polygon type', () => {
            const polygon1 = {
                flat: [
                    0, 0,
                    0, 1,
                    1, 0
                ],
                holes: [],
                clipped: []
            };
            const dataframe = new Dataframe({
                center: { x: 0, y: 0 },
                scale: 1,
                geom: [[polygon1]],
                properties: {
                    numeric_property: [0],
                    cartodb_id: [0]
                },
                type: GEOMETRY_TYPE.POLYGON,
                size: 1,
                active: true,
                metadata: new Metadata({
                    properties: {
                        cartodb_id: {
                            type: 'number'
                        },
                        numeric_property: {
                            type: 'number'
                        }
                    },
                    idProperty: 'cartodb_id'
                })
            });

            const viz = {
                strokeWidth: { eval: () => 1 },
                filter: { eval: () => 1.0 },
                transform: { default: true }
            };
            dataframe.matrix = m;
            dataframe.renderer = { _zoom: 1, gl: { canvas: { width: 1024 * window.devicePixelRatio, height: 1024 * window.devicePixelRatio } }, drawMetadata: { zoomLevel: 0 } };

            const feature1 = {
                numeric_property: 0,
                cartodb_id: 0
            };
            it('should return an empty list when there are no features at the given position', () => {
                expect(dataframe.getFeaturesAtPosition({ x: -2, y: 0.0 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 512, y: 514 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 0, y: 1026 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 1026, y: 0 }, viz)).toEqual([]);
            });
            it('should return a list containing the features at the given position', () => {
                expectEqualFeatures(dataframe.getFeaturesAtPosition({ x: 0, y: 0 }, viz), [feature1]);
                expectEqualFeatures(dataframe.getFeaturesAtPosition({ x: 512, y: 512 }, viz), [feature1]);
                expectEqualFeatures(dataframe.getFeaturesAtPosition({ x: 0, y: 1024 }, viz), [feature1]);
                expectEqualFeatures(dataframe.getFeaturesAtPosition({ x: 1024, y: 0 }, viz), [feature1]);
            });
            it('should return zero features when the filter is not passed', () => {
                const viz = {
                    strokeWidth: { eval: () => 1 },
                    filter: { eval: () => 0.0 },
                    transform: { default: true }
                };
                expect(dataframe.getFeaturesAtPosition({ x: 0, y: 0 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 512, y: 512 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 0, y: 1024 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 1024, y: 0 }, viz)).toEqual([]);
            });
        });
    });

    describe('.pointInTriangle', () => {
        it('should return true if the point is contained in the triangle', () => {
            expect(pointInTriangle({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: -1 }, { x: -1, y: -1 })).toBe(true);
        });

        it('should return false if the point is not contained in the triangle', () => {
            expect(pointInTriangle({ x: 1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: -1 }, { x: -1, y: -1 })).toBe(false);
        });

        it('should return false if the triangle has zero area', () => {
            expect(pointInTriangle({ x: 0, y: 1 }, { x: 0, y: 1 }, { x: 0, y: -1 }, { x: 0, y: -1 })).toBe(false);
        });
    });

    describe('.getRenderedCentroid', () => {
        const MAX_LATITUDE_MERCATOR = 85.0511287798066; // +/-85.0511287798066 are max north & south limits of tile

        describe('when dataframe is point type', () => {
            function dataFrameWithPoint (vertices) {
                const dataframe = new Dataframe({
                    center: { x: 0, y: 0 },
                    scale: 1,
                    geom: new Float32Array(vertices),
                    properties: {
                        id: [1]
                    },
                    type: GEOMETRY_TYPE.POINT,
                    size: 1,
                    active: true,
                    metadata: new Metadata({
                        properties: {
                            id: {
                                type: 'number'
                            }
                        },
                        idProperty: 'id'
                    })
                });

                dataframe.renderer = { _zoom: 1, gl: { canvas: { width: 1024 * window.devicePixelRatio, height: 1024 * window.devicePixelRatio } } };
                dataframe.matrix = m;
                return dataframe;
            }

            const feature1 = { id: 1 };

            it('should return the centroid for the required feature', () => {
                const points = [
                    { coordinates: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], expected: [0, 0] },
                    { coordinates: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], expected: [180, MAX_LATITUDE_MERCATOR] },
                    { coordinates: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], expected: [-180, -MAX_LATITUDE_MERCATOR] },
                    { coordinates: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1], expected: [0, MAX_LATITUDE_MERCATOR] }
                ];

                points.forEach((point) => {
                    const dataframe = dataFrameWithPoint(point.coordinates);

                    const [x1, y1] = dataframe.getRenderedCentroid(feature1.id);
                    expect(x1).toBeCloseTo(point.expected[0], 2);
                    expect(y1).toBeCloseTo(point.expected[1], 2);
                });
            });
        });

        describe('when dataframe is line type', () => {
            function dataFrameWithLine (segment) {
                const dataframe = new Dataframe({
                    center: { x: 0, y: 0 },
                    scale: 1,
                    geom: [[segment]],
                    properties: {
                        numeric_prop: [1],
                        cartodb_id: [0]
                    },
                    type: GEOMETRY_TYPE.LINE,
                    size: 1,
                    active: true,
                    metadata: new Metadata({
                        properties: {
                            numeric_prop: {
                                type: 'number'
                            },
                            cartodb_id: {
                                type: 'number'
                            }
                        },
                        idProperty: 'cartodb_id'
                    })
                });
                dataframe.matrix = m;
                dataframe.renderer = { _zoom: 1, gl: { canvas: { width: 1024 * window.devicePixelRatio, height: 1024 * window.devicePixelRatio } }, drawMetadata: { zoomLevel: 0 } };

                return dataframe;
            }

            const feature1 = {
                numeric_prop: 1,
                cartodb_id: 0
            };

            it('should return the centroid for the required feature', () => {
                const lines = [
                    { segment: [0.0, 0.0, 1.0, 0.0], expected: [90, 0], description: '0,0 to 180,0' },
                    { segment: [-1.0, 0.0, 1.0, 0.0], expected: [0, 0], description: '-180,0 to 180,0' },
                    { segment: [0.5, 1.0, 1.0, 1.0], expected: [135, MAX_LATITUDE_MERCATOR], description: '90,85.05 to 180,85.05' },
                    { segment: [-1.0, -1.0, 1.0, 1.0], expected: [0, 0], description: '-180,-85.05 to 180,85.05' },
                    { segment: [0.0, 0.0, 0.0, 1.0], expected: [0, 66.51], description: '0,0 to 0,85.05' } // 66.51 is the center
                ];

                lines.forEach(line => {
                    const dataframe = dataFrameWithLine(line.segment);

                    const [x1, y1] = dataframe.getRenderedCentroid(feature1.cartodb_id);
                    expect(x1).toBeCloseTo(line.expected[0], 2, 'line: ' + line.description);
                    expect(y1).toBeCloseTo(line.expected[1], 2, 'line: ' + line.description);
                });
            });
        });

        describe('when dataframe is polygon type', () => {
            function dataFrameWithPolygon (polygon) {
                const dataframe = new Dataframe({
                    center: { x: 0, y: 0 },
                    scale: 1,
                    geom: [[polygon]],
                    properties: {
                        numeric_property: [0],
                        cartodb_id: [0]
                    },
                    type: GEOMETRY_TYPE.POLYGON,
                    size: 1,
                    active: true,
                    metadata: new Metadata({
                        properties: {
                            cartodb_id: {
                                type: 'number'
                            },
                            numeric_property: {
                                type: 'number'
                            }
                        },
                        idProperty: 'cartodb_id'
                    })
                });
                dataframe.matrix = m;
                dataframe.renderer = { _zoom: 1, gl: { canvas: { width: 1024 * window.devicePixelRatio, height: 1024 * window.devicePixelRatio } }, drawMetadata: { zoomLevel: 0 } };

                return dataframe;
            }

            const feature1 = {
                numeric_property: 0,
                cartodb_id: 0
            };

            it('should return the centroid for the required feature', () => {
                const polygons = [
                    { flat: [0, 0, 0, 1, 1, 1, 1, 0, 0, 0], holes: [], clipped: [], expected: [90, 66.51], description: 'NE quadrant' },
                    { flat: [0, 0, -1, 0, -1, -1, 0, -1, 0, 0], holes: [], clipped: [], expected: [-90, -66.51], description: 'SW quadrant' },
                    { flat: [-1, -1, 1, -1, 1, 1, -1, 1, -1, -1], holes: [], clipped: [], expected: [0, 0], description: 'Whole world' }
                ];

                polygons.forEach(polygon => {
                    const dataframe = dataFrameWithPolygon(polygon);

                    const [x1, y1] = dataframe.getRenderedCentroid(feature1.cartodb_id);
                    expect(x1).toBeCloseTo(polygon.expected[0], 2, 'polygon: ' + polygon.description);
                    expect(y1).toBeCloseTo(polygon.expected[1], 2, 'polygon: ' + polygon.description);
                });
            });
        });
    });
});

function expectEqualFeatures (result, expected) {
    expect(result.length).toEqual(expected.length);
    expected.forEach((_, index) => {
        Object.keys(expected).forEach(propertyName => {
            expect(result[index][propertyName]).toEqual(expected[index][propertyName]);
        });
    });
}
