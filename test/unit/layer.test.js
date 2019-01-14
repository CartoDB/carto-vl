import { Layer, Viz, source } from '../../src/index';
import { CartoValidationTypes as cvt } from '../../src/errors/carto-validation-error';
import { GEOMETRY_TYPE } from '../../src/utils/geometry';
const { Dataset, GeoJSON, SQL } = source;

describe('api/layer', () => {
    let source;
    let viz, viz2;

    beforeEach(() => {
        source = new GeoJSON({
            'type': 'Feature',
            'geometry': {
                'type': 'LineString',
                'coordinates': [
                    [-64.73, 32.31],
                    [-80.19, 25.76],
                    [-66.09, 18.43],
                    [-64.73, 32.31]
                ]
            }
        });
        viz = new Viz();
        viz2 = new Viz();
    });

    describe('constructor', () => {
        it('should build a new Layer with (id, source, viz)', () => {
            const layer = new Layer('layer0', source, viz);
            expect(layer._id).toEqual('layer0');
            expect(layer._source).toEqual(source);
            pending('Layer constructor can fail asynchronously, therefore, we must have some way to detect load event');
            expect(layer._viz).toEqual(viz);
        });

        it('should throw an error if id is not valid', () => {
            expect(() => {
                new Layer();
            }).toThrowError(cvt.MISSING_REQUIRED + ' \'id\'');

            expect(() => {
                new Layer({});
            }).toThrowError(cvt.INCORRECT_TYPE + ' \'id\' property must be a string.');

            expect(() => {
                new Layer('');
            }).toThrowError(cvt.INCORRECT_VALUE + ' \'id\' property must be not empty.');
        });

        it('should throw an error if source is not valid', () => {
            expect(() => {
                new Layer('layer0');
            }).toThrowError(cvt.MISSING_REQUIRED + ' \'source\'');

            expect(() => {
                new Layer('layer0', {});
            }).toThrowError(cvt.INCORRECT_TYPE + ' The given object is not a valid \'source\'. See "carto.source".');
        });

        it('should throw an error if viz is not valid', () => {
            expect(() => {
                new Layer('layer0', source);
            }).toThrowError(cvt.MISSING_REQUIRED + ' \'viz\'');

            expect(() => {
                new Layer('layer0', source, {});
            }).toThrowError(cvt.INCORRECT_TYPE + ' The given object is not a valid \'viz\'. See "carto.Viz".');
        });

        it('should throw an error if a viz is already added to another layer', () => {
            new Layer('layer1', source, viz);
            expect(() => {
                new Layer('layer2', source, viz);
            }).toThrowError(cvt.INCORRECT_VALUE + ' The given Viz object is already bound to another layer. Vizs cannot be shared between different layers.');
        });
    });

    describe('cloning the source', () => {
        it('should be done with Dataset sources', () => {
            const source = new Dataset('populated_places', {
                username: 'test',
                apiKey: '1234567890'
            });
            const layer = new Layer('layer0', source, new Viz());
            expect(layer._source).not.toBe(source);
        });
        it('should be done with SQL sources', () => {
            const source = new SQL('SELECT * FROM populated_places', {
                username: 'test',
                apiKey: '1234567890'
            });
            const layer = new Layer('layer0', source, new Viz());
            expect(layer._source).not.toBe(source);
        });
        it('should be done with GeoJSON sources', () => {
            const source = new GeoJSON({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [0, 0]
                },
                properties: {}
            });
            const layer = new Layer('layer0', source, new Viz());
            expect(layer._source).not.toBe(source);
        });
    });

    describe('.blendToViz', () => {
        it('should resolve the promise if a valid viz is passed', (done) => {
            const layer = new Layer('layer0', source, viz);
            // Mocks
            layer._vizChanged = () => Promise.resolve();
            layer.metadata = { geomType: GEOMETRY_TYPE.POINT };
            layer._context = Promise.resolve(null);
            layer.map = { triggerRepaint: () => { } };
            layer._sourcePromise.then(() => {
                layer.blendToViz(viz2).then(done);
            });
        });
        it('should reject the promise if viz is undefined', (done) => {
            const layer = new Layer('layer0', source, viz);
            layer.blendToViz().catch(error => {
                expect(error.message).toBe(cvt.MISSING_REQUIRED + ' \'viz\'');
                done();
            });
        });
        it('should reject the promise when viz is not a valid viz', (done) => {
            const layer = new Layer('layer0', source, viz);
            layer.blendToViz(2).catch(error => {
                expect(error.message).toBe(cvt.INCORRECT_TYPE + ' The given object is not a valid \'viz\'. See "carto.Viz".');
                done();
            });
        });
        it('should reject the promise if a viz is already added to another layer', (done) => {
            const layer = new Layer('layer0', source, viz);
            new Layer('layer1', source, viz2);
            layer.blendToViz(viz2).catch(error => {
                expect(error.message).toBe(cvt.INCORRECT_VALUE + ' The given Viz object is already bound to another layer. Vizs cannot be shared between different layers.');
                done();
            });
        });
    });

    describe('.addTo', () => {
        it('should call onMapLoaded when the map is loaded', () => {
            const layer = new Layer('layer0', source, viz);
            const mapMock = {
                addLayer: jasmine.createSpy('addLayer'),
                once: () => { }
            };
            layer.addTo(mapMock, 'beforeLayer');
            expect(mapMock.addLayer).toHaveBeenCalledWith(layer, 'beforeLayer');
        });
    });

    describe('.remove', () => {
        it('should call onMapLoaded when the map is loaded', () => {
            const layer = new Layer('layer0', source, viz);
            layer.onAdd = (map) => { layer.map = map; };
            const mapMock = {
                addLayer: (layer) => { layer.onAdd(mapMock); },
                removeLayer: jasmine.createSpy('removeLayer'),
                once: () => { }
            };
            layer.addTo(mapMock);
            layer.remove();
            expect(mapMock.removeLayer).toHaveBeenCalledWith(layer.id);
        });
    });

    describe('.getFeaturesAtPosition', () => {
        it('should add a layerId to every feature in the list', () => {
            const layer = new Layer('layer0', source, viz);
            const fakeFeature0 = {
                properties: {},
                id: 'fakeId0'
            };

            const fakeFeature1 = {
                properties: {},
                id: 'fakeId0'
            };
            spyOn(layer._renderLayer, 'getFeaturesAtPosition').and.returnValue([{ fakeFeature0, fakeFeature1 }]);

            expect(layer.getFeaturesAtPosition()[0].layerId).toEqual('layer0');
            expect(layer.getFeaturesAtPosition()[0].layerId).toEqual('layer0');
        });
    });
});
