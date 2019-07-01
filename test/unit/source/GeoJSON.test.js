import GeoJSON from '../../../src/sources/GeoJSON';
import { CartoValidationErrorTypes } from '../../../src/errors/carto-validation-error';
import { regExpThatContains as thatContains } from '../../../src/utils/util';

describe('sources/GeoJSON', () => {
    const createVizMock = (columns = []) => {
        return {
            getMinimumNeededSchema: () => {
                const mns = {};
                columns.forEach(column => { mns[column] = [{ type: 'unaggregated' }]; });
                return mns;
            }
        };
    };

    const createData = () => {
        return {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [0, 0]
                },
                properties: {
                    numeric: 1,
                    category: 'red'
                }
            }, {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [20, 20]
                },
                properties: {
                    numeric: 2,
                    category: 'blue'
                }
            }]
        };
    };

    it('_decodeUnboundProperties() should return a valid Dataframe properties object', done => {
        const source = new GeoJSON(createData());
        source.requestMetadata(createVizMock(['numeric', 'category'])).then(() => {
            const properties = source._decodeUnboundProperties();
            const expected = {
                numeric: new Float32Array(2 + 1024),
                category: new Float32Array(2 + 1024),
                cartodb_id: new Float32Array(2 + 1024)
            };
            expected.numeric[0] = 1;
            expected.numeric[1] = 2;
            expected.category[0] = 0;
            expected.category[1] = 1;
            expected.cartodb_id[0] = -0;
            expected.cartodb_id[1] = -1;
            expect(properties).toEqual(expected);

            done();
        });
    });

    describe('constructor', () => {
        it('should build a new Source with (data) as a Feature', () => {
            const data = {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [0, 0]
                }
            };
            const source = new GeoJSON(data);
            expect(source._features).toEqual([{
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [0, 0]
                },
                properties: {}
            }]);
        });

        it('should build a new Source with (data) as a FeatureCollection', () => {
            const data = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [0, 0]
                    }
                }]
            };
            const source = new GeoJSON(data);
            expect(source._features).toEqual([{
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [0, 0]
                },
                properties: {}
            }]);
        });

        it('should compute the center of the coordinates', () => {
            const source = new GeoJSON(createData());
            const dataframeCenter = source._getDataframeCenter();
            expect(dataframeCenter).toBeDefined();
            expect(dataframeCenter.x).toBeCloseTo(0.0555);
            expect(dataframeCenter.y).toBeCloseTo(0.0567);
        });

        it('should compute metadata for numeric and category properties', done => {
            const source = new GeoJSON(createData());
            const expected = {
                properties: {
                    cartodb_id: {
                        type: 'number',
                        min: Number.POSITIVE_INFINITY,
                        max: Number.NEGATIVE_INFINITY,
                        avg: Number.NaN,
                        sum: 0,
                        count: 0
                    },
                    numeric: {
                        type: 'number',
                        min: 1,
                        max: 2,
                        avg: 1.5,
                        sum: 3,
                        count: 2
                    },
                    category: {
                        type: 'category',
                        categoryNames: ['red', 'blue']
                    }
                },
                featureCount: 2,
                sample: [
                    {
                        numeric: 1,
                        category: 'red'
                    },
                    {
                        numeric: 2,
                        category: 'blue'
                    }
                ]
            };
            source.requestMetadata(createVizMock(['numeric', 'category'])).then(metadata => {
                expect(metadata.columns).toEqual(expected.columns);
                expect(metadata.categoryIDs).toEqual(expected.categoryIDs);
                expect(metadata.featureCount).toEqual(expected.featureCount);
                expect(metadata.sample).toEqual(expected.sample);

                done();
            });
        });

        it('should throw an error if data is not valid', () => {
            expect(() => {
                new GeoJSON();
            }).toThrowError(thatContains(CartoValidationErrorTypes.MISSING_REQUIRED + ' \'data\''));

            expect(() => {
                new GeoJSON(1234);
            }).toThrowError(thatContains(CartoValidationErrorTypes.INCORRECT_TYPE + ' \'data\' property must be an object.'));

            expect(() => {
                new GeoJSON({});
            }).toThrowError(thatContains(CartoValidationErrorTypes.INCORRECT_VALUE + ' \'data\' property must be a GeoJSON object.'));
        });

        it('should throw an error if data has different feature types', () => {
            const source = new GeoJSON({
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [0, 0]
                    }
                },
                {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [[0, 0], [1, 1]]
                    }
                }]
            });
            expect(() => {
                source.requestData();
            }).toThrowError(thatContains(CartoValidationErrorTypes.INCORRECT_TYPE + ' multiple geometry types not supported: found \'line\' instead of \'point\'.'));
        });

        it('should not thrown an error if data contains Lines and MultiLines', () => {
            const source = new GeoJSON({
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [[0, 0, [1, 1]]]
                    }
                },
                {
                    type: 'Feature',
                    geometry: {
                        type: 'MultiLineString',
                        coordinates: [[[0, 0], [1, 1]]]
                    }
                }]
            });
            expect(() => {
                source.requestData();
            }).not.toThrowError();
        });

        it('should not thrown an error if data contains Polygon and MultiPolygons', () => {
            const source = new GeoJSON({
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[[0, 0], [1, 1], [2, 2]]]
                    }
                },
                {
                    type: 'Feature',
                    geometry: {
                        type: 'MultiPolygon',
                        coordinates: [[[[0, 0], [1, 1], [2, 2]]]]
                    }
                }]
            });
            expect(() => {
                source.requestData();
            }).not.toThrowError();
        });

        describe('decodeGeometry', () => {
            it('should load a cw polygon', () => {
                const source = new GeoJSON({
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [[0, 0], [0, 80], [80, 80], [0, 0]],
                            [[20, 20], [50, 50], [20, 50], [20, 20]]
                        ]
                    }
                });
                let geom = source._decodeGeometry();

                let actualFlat = geom[0][0].flat;
                let expectedFlat = [
                    0, 0, 0, 0.775, 0.444, 0.775, 0, 0,
                    0.111, 0.113, 0.2778, 0.322, 0.111, 0.322, 0.111, 0.113];
                actualFlat.forEach((x, i) => expect(x).toBeCloseTo(expectedFlat[i], 3));

                let actualHoles = geom[0][0].holes;
                let expectedHoles = [4];
                actualHoles.forEach((x, i) => expect(x).toBe(expectedHoles[i]));
            });

            it('should load a ccw polygon', () => {
                const source = new GeoJSON({
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            [[0, 0], [80, 80], [0, 80], [0, 0]],
                            [[20, 20], [20, 50], [50, 50], [20, 20]]
                        ]
                    }
                });
                let geom = source._decodeGeometry();

                let actualFlat = geom[0][0].flat;
                let expectedFlat = [
                    0, 0, 0, 0.775, 0.444, 0.775, 0, 0,
                    0.111, 0.113, 0.2778, 0.322, 0.111, 0.322, 0.111, 0.113];
                actualFlat.forEach((x, i) => expect(x).toBeCloseTo(expectedFlat[i], 3));

                let actualHoles = geom[0][0].holes;
                let expectedHoles = [4];
                actualHoles.forEach((x, i) => expect(x).toBe(expectedHoles[i]));
            });
        });

        describe('cartodb_id', () => {
            it('should be auto generated and unique for a single feature', done => {
                const data = {
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [0, 0] }
                };
                const source = new GeoJSON(data);
                source.requestMetadata(createVizMock()).then(() => {
                    const properties = source._decodeUnboundProperties();
                    expect(properties.cartodb_id[0]).toEqual(-0);
                    done();
                });
            });

            it('should be auto generated and unique for every feature in a featureCollection', done => {
                const data = {
                    type: 'FeatureCollection',
                    features: [{
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [0, 0] }
                    },
                    {
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [1, 0] }
                    },
                    {
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [3, 0] }
                    }]
                };
                const source = new GeoJSON(data);
                source.requestMetadata(createVizMock()).then(() => {
                    const props = source._decodeUnboundProperties();
                    expect(props.cartodb_id[0]).toEqual(-0);
                    expect(props.cartodb_id[1]).toEqual(-1);
                    expect(props.cartodb_id[2]).toEqual(-2);
                    done();
                });
            });

            it('should not mutate the original data', () => {
                const data = {
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [0, 0] }
                };
                new GeoJSON(data);
                expect(data.properties.cartodb_id).toBeUndefined();
            });
        });
    });

    it('should call the addDataframe callback when the dataframe is added', () => {
        const source = new GeoJSON({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [0, 0]
            }
        });

        const fakeAddDataframe = jasmine.createSpy('addDataframe');
        source.bindLayer(fakeAddDataframe);
        expect(fakeAddDataframe).not.toHaveBeenCalled();
        source.requestData();
        expect(fakeAddDataframe).toHaveBeenCalled();
    });
});
