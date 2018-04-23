import Dataset from '../../../src/api/source/dataset';
import SQL from '../../../src/api/source/sql';
import GeoJSON from '../../../src/api/source/geojson';
import Viz from '../../../src/api/viz';
import Layer from '../../../src/api/layer';

describe('api/layer', () => {
    let source;
    let viz, viz2;

    beforeEach(() => {
        source = new Dataset('ne_10m_populated_places_simple', {
            user: 'test',
            apiKey: '1234567890'
        });
        viz = new Viz();
        viz2 = new Viz();
    });

    describe('constructor', () => {
        it('should build a new Layer with (id, source, viz)', () => {
            const layer = new Layer('layer0', source, viz);
            expect(layer.getId()).toEqual('layer0');
            expect(layer.getSource()).toEqual(source);
            pending('Layer constructor can fail asynchronously, therefore, we must have some way to detect load event');
            expect(layer.getViz()).toEqual(viz);
        });

        it('should throw an error if id is not valid', () => {
            expect(() => {
                new Layer();
            }).toThrowError('`id` property required.');
            expect(() => {
                new Layer({});
            }).toThrowError('`id` property must be a string.');
            expect(() => {
                new Layer('');
            }).toThrowError('`id` property must be not empty.');
        });

        it('should throw an error if source is not valid', () => {
            expect(() => {
                new Layer('layer0');
            }).toThrowError('`source` property required.');
            expect(() => {
                new Layer('layer0', {});
            }).toThrowError('The given object is not a valid source. See "carto.source.Base".');
        });

        it('should throw an error if viz is not valid', () => {
            expect(() => {
                new Layer('layer0', source);
            }).toThrowError('`viz` property required.');
            expect(() => {
                new Layer('layer0', source, {});
            }).toThrowError('The given object is not a valid viz. See "carto.Viz".');
        });


        it('should throw an error if a viz is already added to another layer', () => {
            new Layer('layer1', source, viz);
            expect(() => {
                new Layer('layer2', source, viz);
            }).toThrowError('The given Viz object is already bound to another layer. Vizs cannot be shared between different layers');
        });
    });

    describe('cloning the source', () => {
        it('should be done with Dataset sources', () => {
            const source = new Dataset('ne_10m_populated_places_simple', {
                user: 'test',
                apiKey: '1234567890'
            });
            const layer = new Layer('layer0', source, new Viz());
            expect(layer.getSource()).not.toBe(source);
        });
        it('should be done with SQL sources', () => {
            const source = new SQL('SELECT * FROM ne_10m_populated_places_simple', {
                user: 'test',
                apiKey: '1234567890'
            });
            const layer = new Layer('layer0', source, new Viz());
            expect(layer.getSource()).not.toBe(source);
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
            expect(layer.getSource()).not.toBe(source);
        });
    });

    describe('.blendToViz', () => {
        it('should not throw an error if a valid viz is passed', () => {
            const layer = new Layer('layer0', source, viz);
            expect(function () {
                layer.blendToViz(viz2);
            }).not.toThrow();
        });
        it('should throw an error if viz is undefined', () => {
            const layer = new Layer('layer0', source, viz);
            expect(function () {
                layer.blendToViz();
            }).toThrowError('`viz` property required.');
        });
        it('should throw an error when viz is not a valid viz', () => {
            const layer = new Layer('layer0', source, viz);
            expect(function () {
                layer.blendToViz(2);
            }).toThrowError('The given object is not a valid viz. See "carto.Viz".');
        });
        it('should throw an error if a viz is already added to another layer', () => {
            const layer = new Layer('layer0', source, viz);
            new Layer('layer1', source, viz2);
            expect(() => {
                layer.blendToViz(viz2);
            }).toThrowError('The given Viz object is already bound to another layer. Vizs cannot be shared between different layers');
        });
    });

    describe('.addTo', () => {
        describe('._addToMGLMap', () => {
            beforeEach(() => {
                this.layer = new Layer('layer0', source, viz);
                this.layer._onMapLoaded = () => { };
                spyOn(this.layer, '_onMapLoaded');
            });

            it('should call onMapLoaded when the map is loaded', () => {
                const mapMock = { isStyleLoaded: () => true };
                this.layer._addToMGLMap(mapMock);
                expect(this.layer._onMapLoaded).toHaveBeenCalledWith(mapMock, undefined);
            });

            it('should not call onMapLoaded when the map is not loaded', () => {
                const mapMock = { isStyleLoaded: () => false, on: () => { } };
                this.layer._addToMGLMap(mapMock);
                expect(this.layer._onMapLoaded).not.toHaveBeenCalled();
            });

            it('should call onMapLoaded when the map `load` event is triggered', () => {
                const mapMock = {
                    isStyleLoaded: () => false,
                    on: (id, callback) => {
                        if (id === 'load') {
                            callback();
                        }
                    }
                };
                this.layer._addToMGLMap(mapMock);
                expect(this.layer._onMapLoaded).toHaveBeenCalledWith(mapMock, undefined);
            });

            it('should not call onMapLoaded when other the map event is triggered', () => {
                const mapMock = {
                    isStyleLoaded: () => false,
                    on: (id, callback) => {
                        if (id === 'other') {
                            callback();
                        }
                    }
                };
                this.layer._addToMGLMap(mapMock);
                expect(this.layer._onMapLoaded).not.toHaveBeenCalled();
            });
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
