import GeoJSON from '../../../../src/api/source/geojson';

describe('api/source/geojson', () => {


    const createVizMock = (columns = []) => {
        return {
            getMinimumNeededSchema: () => { return { columns }; }
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
                    coordinates: [1, 0]
                },
                properties: {
                    numeric: 2,
                    category: 'blue'
                }
            }]
        };
    };

    it('_decodeProperties() should return a valid Dataframe properties object', done => {
        const source = new GeoJSON(createData());
        source.requestMetadata(createVizMock(['numeric', 'category'])).then(() => {
            const properties = source._decodeProperties();
            const expected = {
                numeric: new Float32Array(2 + 1024),
                category: new Float32Array(2 + 1024),
                cartodb_id: new Float32Array(2 + 1024),
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
                },
                properties: {}
            };
            const source = new GeoJSON(data);
            expect(source._features).toEqual([{
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [0, 0]
                },
                properties: {},
            }]);
        });

        it('should requestData just once', () => {
            const data = {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [0, 0]
                },
                properties: {}
            };
            const source = new GeoJSON(data);

            source.bindLayer(_ => _, _ => _, _ => _);
            spyOn(source, '_addDataframe');

            expect(source._addDataframe).toHaveBeenCalledTimes(0);
            source.requestData();
            expect(source._addDataframe).toHaveBeenCalledTimes(1);
            source.requestData();
            expect(source._addDataframe).toHaveBeenCalledTimes(1);
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
                    properties: {}
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

        it('should compute metadata for numeric and category properties', done => {
            const source = new GeoJSON(createData());
            const expected = {
                columns: [
                    {
                        name: 'cartodb_id',
                        type: 'number',
                        min: Number.POSITIVE_INFINITY,
                        max: Number.NEGATIVE_INFINITY,
                        avg: Number.NaN,
                        sum: 0,
                        count: 0
                    },
                    {
                        name: 'numeric',
                        type: 'number',
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
                    },
                ],
                categoryIDs: {
                    red: 0,
                    blue: 1
                },
                featureCount: 2,
                sample: [
                    {
                        numeric: 1,
                        category: 'red',
                    },
                    {
                        numeric: 2,
                        category: 'blue',
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
                    properties: {}
                },
                {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [[0, 0], [1, 1]]
                    },
                    properties: {}
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
                properties: {}
            });
            expect(function () {
                source.requestData();
            }).toThrowError('first polygon ring must be external.');
        });

        describe('cartodb_id', () => {
            it('should be auto generated and unique for a single feature', done => {
                const data = {
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [0, 0] },
                    properties: {}
                };
                const source = new GeoJSON(data);
                source.requestMetadata(createVizMock()).then(() => {
                    const properties = source._decodeProperties();
                    expect(properties.cartodb_id[0]).toEqual(-0);
                    done();
                });

            });

            it('should be auto generated and unique for every feature in a featureCollection', done => {
                const data = {
                    type: 'FeatureCollection',
                    features: [{
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [0, 0] },
                        properties: {}
                    },
                    {
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [1, 0] },
                        properties: {}
                    },
                    {
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [3, 0] },
                        properties: {}
                    }]
                };
                const source = new GeoJSON(data);
                source.requestMetadata(createVizMock()).then(() => {
                    const props = source._decodeProperties();
                    expect(props.cartodb_id[0]).toEqual(-0);
                    expect(props.cartodb_id[1]).toEqual(-1);
                    expect(props.cartodb_id[2]).toEqual(-2);
                    done();
                });
            });

            it('should not mutate the original data', () => {
                const data = {
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [0, 0] },
                    properties: {}
                };
                new GeoJSON(data);
                expect(data.properties.cartodb_id).toBeUndefined();
            });
        });
    });

    it('should call the dataLoaded callback when the dataframe is added', () => {
        const source = new GeoJSON({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [0, 0]
            },
            properties: {}
        });

        const fakeAddDataframe = jasmine.createSpy('addDataframe');
        const fakeRemoveDataframe = jasmine.createSpy('removeDataframe');
        const fakeDataLoaded = jasmine.createSpy('dataLoaded');
        source.bindLayer(fakeAddDataframe, fakeRemoveDataframe, fakeDataLoaded);
        expect(fakeDataLoaded).not.toHaveBeenCalled();
        source.requestData();
        expect(fakeDataLoaded).toHaveBeenCalled();
    });
});
