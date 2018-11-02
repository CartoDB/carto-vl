import carto from '../../../../src/';
import * as util from '../../util';
import { mat4 } from 'gl-matrix';

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
        layer._paintLayer = () => {};
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
                setTimeout(() => {
                    expect(update).toHaveBeenCalled();
                    done();
                }, 0);
            });
        });

        it('should fire a "updated" event when the source is updated', (done) => {
            layer.on('loaded', async () => {
                await layer.update(new carto.source.GeoJSON(featureData));
                let update = jasmine.createSpy('update');
                layer.on('updated', update);
                layer.render();
                expect(update).toHaveBeenCalledTimes(1);
                done();
            });
        });

        it('should fire a "updated" event when the viz is updated', (done) => {
            layer.on('loaded', async () => {
                await layer.update(source, new carto.Viz('color: blue'));
                let update = jasmine.createSpy('update');
                layer.on('updated', update);
                layer.render();
                expect(update).toHaveBeenCalled();
                done();
            });
        });

        it('should fire a "updated" event when the viz is animated', async (done) => {
            let update = jasmine.createSpy('update');
            await layer.update(source, new carto.Viz('width: now()'));
            layer.on('updated', update);
            layer.on('loaded', () => {
                layer.render();
                expect(update).toHaveBeenCalled();
                layer.render();
                expect(update).toHaveBeenCalled();
                done();
            });
        });

        describe('.hide', () => {
            it('should hide a visible layer', (done) => {
                layer.on('loaded', () => {
                    expect(layer.visible).toBeTruthy();
                    layer.hide();
                    expect(layer.visible).toBeFalsy();
                    done();
                });
            });

            it('should trigger an update event', (done) => {
                layer.on('loaded', () => {
                    layer.on('updated', done);
                    layer.hide();
                });
            });

            it('should not request source data', (done) => {
                layer.on('loaded', () => {
                    const requestDataSourceSpy = spyOn(layer._source, 'requestData');
                    layer.hide();
                    layer.prerender();

                    expect(requestDataSourceSpy).not.toHaveBeenCalled();
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
                    expect(layer.visible).toBeFalsy();
                    layer.show();
                    expect(layer.visible).toBeTruthy();
                    done();
                });
            });

            it('should request source data', (done) => {
                layer.on('loaded', () => {
                    const requestDataFn = layer._source.requestData.bind(layer._source);
                    let requestDataCalled = false;
                    layer._source.requestData = (...args) => {
                        requestDataCalled = true;
                        return requestDataFn(...args);
                    };
                    // spyOn(layer._source, 'requestData');
                    layer.hide();
                    layer.show();
                    layer.prerender(undefined, mat4.identity([]));
                    layer._matrix = mat4.identity([]);
                    layer._matrix[0] = 2;
                    layer.prerender(undefined, mat4.identity([]));

                    expect(requestDataCalled).toBeTruthy();
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
