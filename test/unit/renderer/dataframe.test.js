import Dataframe from '../../../src/renderer/Dataframe';
import Metadata from '../../../src/renderer/Metadata';
import { pointInTriangle } from '../../../src/utils/geometry';

describe('src/renderer/Dataframe', () => {
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
                type: 'point',
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
                symbol: { default: true }
            };
            dataframe.renderer = { _zoom: 1, gl: { canvas: { clientHeight: 1024 } } };

            it('should return an empty list when there are no points at the given position', () => {
                expect(dataframe.getFeaturesAtPosition({ x: 0.5, y: 0.5 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 5, y: 5 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 1.0, y: 1.0 + 1.001 / 1024 }, viz)).toEqual([]);
            });

            it('should return a list containing the features at the given position', () => {
                expectEqualFeatures(dataframe.getFeaturesAtPosition({ x: 0.0, y: 0.0 }, viz), [feature1]);
                expectEqualFeatures(dataframe.getFeaturesAtPosition({ x: 1.0, y: 1.0 }, viz), [feature2]);
                expectEqualFeatures(dataframe.getFeaturesAtPosition({ x: 1.0, y: 1.0 + 0.999 / 1024 }, viz), [feature2]);
            });

            it('should return zero features when the filter is not passed', () => {
                const viz = {
                    width: { eval: () => 0.5 },
                    strokeWidth: { eval: () => 0.5 },
                    filter: { eval: () => 0.0 }
                };
                expect(dataframe.getFeaturesAtPosition({ x: 0.0, y: 0.0 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 1.0, y: 1.0 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 1.0, y: 1.0 + 0.999 / 1024 }, viz)).toEqual([]);
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
                type: 'line',
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
                filter: { eval: () => 1.0 }
            };

            dataframe.renderer = { _zoom: 1, gl: { canvas: { clientHeight: 1024 } } };

            it('should return an empty list when there are no lines at the given position', () => {
                expect(dataframe.getFeaturesAtPosition({ x: 5, y: 1.001 / 1024 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 5, y: -1.001 / 1024 }, viz)).toEqual([]);
            });

            it('should return a list containing the features at the given position', () => {
                expectEqualFeatures(dataframe.getFeaturesAtPosition({ x: 5, y: 0.999 / 1024 }, viz), [feature1]);
                expectEqualFeatures(dataframe.getFeaturesAtPosition({ x: 5, y: -0.999 / 1024 }, viz), [feature1]);
            });

            it('should return zero features when the filter is not passed', () => {
                const viz = {
                    width: { eval: () => 1 },
                    filter: { eval: () => 0.0 }
                };
                expect(dataframe.getFeaturesAtPosition({ x: 5, y: 0.999 / 1024 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 5, y: -0.999 / 1024 }, viz)).toEqual([]);
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
                type: 'polygon',
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
                filter: { eval: () => 1.0 }
            };
            dataframe.renderer = { _zoom: 1, gl: { canvas: { clientHeight: 1024 } } };
            const feature1 = {
                numeric_property: 0,
                cartodb_id: 0
            };
            it('should return an empty list when there are no features at the given position', () => {
                expect(dataframe.getFeaturesAtPosition({ x: -0.01, y: 0.0 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 0.51, y: 0.51 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 0.0, y: 1.01 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 1.01, y: 0.0 }, viz)).toEqual([]);
            });
            it('should return a list containing the features at the given position', () => {
                expectEqualFeatures(dataframe.getFeaturesAtPosition({ x: 0.0, y: 0.0 }, viz), [feature1]);
                expectEqualFeatures(dataframe.getFeaturesAtPosition({ x: 0.5, y: 0.5 }, viz), [feature1]);
                expectEqualFeatures(dataframe.getFeaturesAtPosition({ x: 0.0, y: 1.0 }, viz), [feature1]);
                expectEqualFeatures(dataframe.getFeaturesAtPosition({ x: 1.0, y: 0.0 }, viz), [feature1]);
            });
            it('should return zero features when the filter is not passed', () => {
                const viz = {
                    strokeWidth: { eval: () => 1 },
                    filter: { eval: () => 0.0 }
                };
                expect(dataframe.getFeaturesAtPosition({ x: 0.0, y: 0.0 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 0.5, y: 0.5 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 0.0, y: 1.0 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 1.0, y: 0.0 }, viz)).toEqual([]);
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
});

function expectEqualFeatures (result, expected) {
    expected.forEach((_, index) => {
        Object.keys(expected).forEach(propertyName => {
            expect(result[index][propertyName]).toEqual(expected[index][propertyName]);
        });
    });
}
