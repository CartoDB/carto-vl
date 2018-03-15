import GeoJSON from '../../../../src/api/source/geojson';

describe('api/source/geojson', () => {
    const data = {
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
                coordinates: [1, 0]
            },
            properties: {
                numeric: 2,
                category: 'blue'
            }
        }]
    };
    it('_decodeProperties() should return a valid Dataframe properties object', () => {
        const source = new GeoJSON(data);
        const properties = source._decodeProperties();
        const expected = {
            numeric: new Float32Array(2 + 1024),
            category: new Float32Array(2 + 1024),
        };
        expected.numeric[0] = 1;
        expected.numeric[1] = 2;
        expected.category[0] = 0;
        expected.category[1] = 1;
        expect(properties).toEqual(expected);
    });
    describe('constructor', () => {
        it('should build a new Source with (data) as a Feature', () => {
            const data = {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [0, 0]
                },
                properties: {
                    cartodb_id: 1
                }
            };
            const source = new GeoJSON(data);
            expect(source._features).toEqual([data]);
        });

        it('should build a new Source with (data) as a FeatureCollection', () => {
            const data = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [0, 0]
                    },
                    properties: {
                        cartodb_id: 1
                    }
                }]
            };
            const source = new GeoJSON(data);
            expect(source._features).toEqual(data.features);
        });

        it('should compute metadata for numeric and category properties', () => {
            const source = new GeoJSON(data);
            const expected = {
                columns: [
                    {
                        name: 'numeric',
                        type: 'float',
                        min: 1,
                        max: 2,
                        avg: 1.5,
                        sum: 3,
                        count: 2
                    },
                    {
                        name: 'category',
                        type: 'category',
                        categoryNames: ['red', 'blue'],
                        categoryCounts: [1, 1],
                    }
                ],
                categoryIDs: {
                    red: 0,
                    blue: 1
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
            expect(source._metadata.columns).toEqual(expected.columns);
            expect(source._metadata.categoryIDs).toEqual(expected.categoryIDs);
            expect(source._metadata.featureCount).toEqual(expected.featureCount);
            expect(source._metadata.sample).toEqual(expected.sample);
        });

        it('should throw an error if data is not valid', function () {
            expect(function () {
                new GeoJSON();
            }).toThrowError('`data` property is required.');
            expect(function () {
                new GeoJSON(1234);
            }).toThrowError('`data` property must be an object.');
            expect(function () {
                new GeoJSON({});
            }).toThrowError('`data` property must be a GeoJSON object.');
        });

        it('should throw an error if data has different feature types', function () {
            const source = new GeoJSON({
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [0, 0]
                    },
                    properties: {
                        cartodb_id: 1
                    }
                },
                {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [[0, 0], [1, 1]]
                    },
                    properties: {
                        cartodb_id: 2
                    }
                }]
            });
            expect(function () {
                source.requestData();
            }).toThrowError('multiple types not supported: Point, LineString.');
        });

        it('should throw an error if data has a the first polygon cw', function () {
            const source = new GeoJSON({
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[0, 0], [0, 1], [1, 1], [0, 0]]
                },
                properties: {
                    cartodb_id: 1
                }
            });
            expect(function () {
                source.requestData();
            }).toThrowError('first polygon ring must be external.');
        });
    });
});
