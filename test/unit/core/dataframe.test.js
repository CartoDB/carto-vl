import Dataframe from '../../../src/core/dataframe';

describe('src/core/dataframe', () => {
    describe('.getFeaturesAtPosition', () => {
        describe('when dataframe is point type', () => {
            const dataframe = new Dataframe({
                center: { x: 0, y: 0 },
                scale: 1,
                geom: [
                    0, 0,
                    1, 1,
                ],
                properties: {
                    id: [1, 2],
                    cartodb_id: [0, 1]
                },
                type: 'point',
                size: 2,
                active: true,
                metadata: {
                    columns: [{
                        name: 'id',
                        type: 'float'
                    },
                    {
                        name: 'cartodb_id',
                        type: 'float'
                    }]
                }
            });
            const feature1 = { id: 0, properties: { id: 1 } };
            const feature2 = { id: 1, properties: { id: 2 } };
            const viz = {
                getWidth: () => ({ eval: () => 0.5 }),
                getStrokeWidth: () => ({ eval: () => 0.5 })
            };
            dataframe.renderer = { _zoom: 1, gl: { canvas: { clientHeight: 1024 } } };

            it('should return an empty list when there are no points at the given position', () => {
                expect(dataframe.getFeaturesAtPosition({ x: 0.5, y: 0.5 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 5, y: 5 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 1.0, y: 1.0 + 1.001 / 1024 }, viz)).toEqual([]);
            });

            it('should return a list containing the features at the given position', () => {
                expect(dataframe.getFeaturesAtPosition({ x: 0.0, y: 0.0 }, viz)).toEqual([feature1]);
                expect(dataframe.getFeaturesAtPosition({ x: 1.0, y: 1.0 }, viz)).toEqual([feature2]);
                expect(dataframe.getFeaturesAtPosition({ x: 1.0, y: 1.0 + 0.999 / 1024 }, viz)).toEqual([feature2]);
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
                metadata: {
                    columns: [{
                        name: 'numeric_prop',
                        type: 'float'
                    }, {
                        name: 'cartodb_id',
                        type: 'float'
                    }]
                }
            });
            const feature1 = {
                id: 0,
                properties: {
                    numeric_prop: 1
                }
            };
            const viz = {
                getWidth: () => ({
                    eval: () => {
                        return 1;
                    }
                })
            };
            dataframe.renderer = { _zoom: 1, gl: { canvas: { clientHeight: 1024 } } };
            it('should return an empty list when there are no lines at the given position', () => {
                expect(dataframe.getFeaturesAtPosition({ x: 5, y: 1.001 / 1024 }, viz)).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 5, y: -1.001 / 1024 }, viz)).toEqual([]);

            });
            it('should return a list containing the features at the given position', () => {
                expect(dataframe.getFeaturesAtPosition({ x: 5, y: 0.999 / 1024 }, viz)).toEqual([feature1]);
                expect(dataframe.getFeaturesAtPosition({ x: 5, y: -0.999 / 1024 }, viz)).toEqual([feature1]);
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
            };
            const dataframe = new Dataframe({
                center: { x: 0, y: 0 },
                scale: 1,
                geom: [[polygon1]],
                properties: {
                    numeric_property: [0],
                    cartodb_id: [0],
                },
                type: 'polygon',
                size: 1,
                active: true,
                metadata: {
                    columns: [
                        {
                            name: 'cartodb_id',
                            type: 'float'
                        },
                        {
                            name: 'numeric_property',
                            type: 'float'
                        }]
                }
            });
            const feature1 = {
                id: 0,
                properties: {
                    numeric_property: 0
                }
            };
            it('should return an empty list when there are no features at the given position', () => {
                expect(dataframe.getFeaturesAtPosition({ x: -0.01, y: 0.0 })).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 0.51, y: 0.51 })).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 0.0, y: 1.01 })).toEqual([]);
                expect(dataframe.getFeaturesAtPosition({ x: 1.01, y: 0.0 })).toEqual([]);
            });
            it('should return a list containing the features at the given position', () => {
                expect(dataframe.getFeaturesAtPosition({ x: 0.0, y: 0.0 })).toEqual([feature1]);
                expect(dataframe.getFeaturesAtPosition({ x: 0.5, y: 0.5 })).toEqual([feature1]);
                expect(dataframe.getFeaturesAtPosition({ x: 0.0, y: 1.0 })).toEqual([feature1]);
                expect(dataframe.getFeaturesAtPosition({ x: 1.0, y: 0.0 })).toEqual([feature1]);
            });
        });

    });
});
