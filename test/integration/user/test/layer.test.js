import * as carto from '../../../../src/';
import { layerVisibility } from '../../../../src/constants/layer';
import * as util from '../../util';

const featureData = {
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [0, 0]
    },
    properties: {}
};

describe('Layer', () => {
    let div, map, source, viz, layer;

    beforeEach(() => {
        const setup = util.createMap('map');
        div = setup.div;
        map = setup.map;

        source = new carto.source.GeoJSON(featureData);
        viz = new carto.Viz(`
            @myColor: red
            color: @myColor
        `);
        layer = new carto.Layer('layer', source, viz);
        layer.addTo(map);
    });

    describe('.on', () => {
        it('should fire a "loaded" event when ready', (done) => {
            layer.on('loaded', done);
        });

        it('should fire a "updated" event when ready', (done) => {
            layer.on('updated', done);
        });

        it('should fire a "updated" event only once when ready', (done) => {
            let update = jasmine.createSpy('update');
            layer.on('updated', update);
            layer.on('loaded', () => {
                expect(update).toHaveBeenCalledTimes(1);
                done();
            });
        });

        it('should fire a "updated" event when the source is updated', (done) => {
            let update = jasmine.createSpy('update');
            layer.on('updated', update);
            layer.on('loaded', async () => {
                await layer.update(new carto.source.GeoJSON(featureData), viz);
                layer.$paintCallback();
                expect(update).toHaveBeenCalledTimes(2);
                done();
            });
        });

        it('should fire a "updated" event when the viz is updated', (done) => {
            let update = jasmine.createSpy('update');
            layer.on('updated', update);
            layer.on('loaded', async () => {
                await layer.update(source, new carto.Viz('color: blue'));
                layer.$paintCallback();
                expect(update).toHaveBeenCalledTimes(2);
                done();
            });
        });

        it('should fire a "updated" event when the _onDataframeAdded is called', (done) => {
            let update = jasmine.createSpy('update');
            layer.on('updated', update);
            layer.on('loaded', () => {
                layer._onDataframeAdded(layer._source._dataframe);
                layer.$paintCallback();
                expect(update).toHaveBeenCalledTimes(2);
                done();
            });
        });

        it('should fire a "updated" event when the viz is animated', async (done) => {
            let update = jasmine.createSpy('update');
            await layer.update(source, new carto.Viz('width: now()'));
            layer.on('updated', update);
            layer.on('loaded', () => {
                layer.$paintCallback();
                expect(update).toHaveBeenCalledTimes(2);
                layer.$paintCallback();
                expect(update).toHaveBeenCalledTimes(3);
                done();
            });
        });

        describe('.hide', () => {
            it('should hide a visible layer', (done) => {
                layer.on('loaded', () => {
                    expect(layer.visibility).toEqual(layerVisibility.VISIBLE);
                    layer.hide();
                    expect(layer.visibility).toEqual(layerVisibility.HIDDEN);
                    done();
                });
            });

            it('should trigger an update event', (done) => {
                let update = jasmine.createSpy('update');

                layer.on('loaded', () => {
                    layer.on('updated', update);
                    layer.hide();
                    expect(update).toHaveBeenCalledTimes(1);
                    done();
                });
            });
        });

        describe('.show', () => {
            beforeEach(() => {
                layer.on('loaded', () => {
                    layer.hide();
                });
            });

            it('should show a hidden layer', (done) => {
                layer.on('loaded', () => {
                    expect(layer.visibility).toEqual(layerVisibility.HIDDEN);
                    layer.show();
                    expect(layer.visibility).toEqual(layerVisibility.VISIBLE);
                    done();
                });
            });
        });
    });

    describe('.blendToViz', () => {
        it('should resolve the Promise with a valid viz', (done) => {
            layer.on('loaded', () => {
                layer.blendToViz(new carto.Viz('color: blue')).then(done);
            });
        });
    });

    afterEach(() => {
        map.remove();
        document.body.removeChild(div);
    });
});
