import GeoJSON from '../../../../src/api/source/geojson';

describe('api/source/geojson', () => {
    describe('constructor', () => {
        it('should build a new Source with (data) as a Feature', () => {
            const data = {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [ 0, 0 ]
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
                        coordinates: [ 0, 0 ]
                    },
                    properties: {
                        cartodb_id: 1
                    }
                }]
            };
            const source = new GeoJSON(data);
            expect(source._features).toEqual(data.features);
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
                        coordinates: [ 0, 0 ]
                    },
                    properties: {
                        cartodb_id: 1
                    }
                },
                {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [ [ 0, 0 ], [ 1, 1 ] ]
                    },
                    properties: {
                        cartodb_id: 2
                    }
                }]
            });
            expect(function () {
                source._requestData();
            }).toThrowError('multiple types not supported: Point, LineString.');
        });

        it('should throw an error if data has a the first polygon cw', function () {
            const source = new GeoJSON({
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [ [ 0, 0 ], [ 0, 1 ], [ 1, 1 ], [ 0, 0 ] ]
                },
                properties: {
                    cartodb_id: 1
                }
            });
            expect(function () {
                source._requestData();
            }).toThrowError('first polygon ring must be external.');
        });
    });
});
