import Dataset from '../../../src/api/source/dataset';
import Style from '../../../src/api/style';
import Layer from '../../../src/api/layer';

describe('api/layer', () => {
    let source;
    let style, style2;

    beforeEach(() => {
        source = new Dataset('ne_10m_populated_places_simple', {
            user: 'test',
            apiKey: '1234567890'
        });
        style = new Style();
        style2 = new Style();
    });

    describe('constructor', () => {
        it('should build a new Layer with (id, source, style)', () => {
            const layer = new Layer('layer0', source, style);
            expect(layer.getId()).toEqual('layer0');
            expect(layer.getSource()).toEqual(source);
            pending('Layer constructor can fail asynchronously, therefore, we must have some way to detect load event');
            expect(layer.getStyle()).toEqual(style);
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

        it('should throw an error if style is not valid', () => {
            expect(() => {
                new Layer('layer0', source);
            }).toThrowError('`style` property required.');
            expect(() => {
                new Layer('layer0', source, {});
            }).toThrowError('The given object is not a valid style. See "carto.Style".');
        });
    });

    describe('.setSource', () => {

    });

    describe('.setStyle', () => {

    });

    describe('.blendToStyle', () => {
        it('should not throw an error if a valid style is passed', () => {
            const layer = new Layer('layer0', source, style);
            expect(function () {
                layer.blendToStyle(style2);
            }).not.toThrow();
        });
        it('should throw an error if style is not valid', () => {
            const layer = new Layer('layer0', source, style);
            expect(function () {
                layer.blendToStyle();
            }).toThrowError('`style` property required.');
            expect(function () {
                layer.blendToStyle(2);
            }).toThrowError('The given object is not a valid style. See "carto.Style".');
        });
    });

    describe('.addTo', () => {
        describe('._addToMGLMap', () => {
            beforeEach(() => {
                this.layer = new Layer('layer0', source, style);
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

    fdescribe('.getFeaturesAtPosition', () => {
        it('should add a layerId to every feature in the list', () => {
            const layer = new Layer('layer0', source, style);
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
