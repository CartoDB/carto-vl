import carto from '../../../../src/';
import * as util from '../../util';

const featureData = {
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [0, 0]
    },
    properties: {}
};

describe('events', () => {
    let div, map, layer1, layer2;

    beforeEach(() => {
        const setup = util.createMap('map');
        div = setup.div;
        map = setup.map;

        const source1 = new carto.source.GeoJSON(featureData);
        const viz1 = new carto.Viz(`
            @myColor: red
            color: @myColor
        `);
        layer1 = new carto.Layer('layer1', source1, viz1);
        layer1.addTo(map);

        const source2 = new carto.source.GeoJSON(featureData);
        const viz2 = new carto.Viz(`
            @myColor: red
            color: @myColor
        `);
        layer2 = new carto.Layer('layer2', source2, viz2);
        layer2.addTo(map);
    });

    describe('.on', () => {
        it('should fire a "loaded" event', (done) => {
            const layerLoaded = jasmine.createSpy('layerLoaded');
            layer1.on('loaded', layerLoaded);
            layer2.on('loaded', layerLoaded);
            carto.on('loaded', [layer1, layer2], () => {
                expect(layerLoaded).toHaveBeenCalledTimes(2);
                done();
            });
        });

        it('should fire "updated" events', (done) => {
            carto.on('updated', [layer1, layer2], done);
        });

        it('should fire a "updated" event only once when ready', (done) => {
            const loaded = jasmine.createSpy('loaded');
            carto.on('loaded', [layer1, layer2], loaded);
            carto.on('updated', [layer1, layer2], () => {
                expect(loaded).toHaveBeenCalledTimes(1);
                done();
            });
        });
    });

    describe('.off', () => {
        it('should stop firing events', done => {
            const layerLoaded = jasmine.createSpy('layerLoaded1');
            carto.on('loaded', [layer1, layer2], layerLoaded);
            carto.off('loaded', [layer1, layer2], layerLoaded);
            carto.on('loaded', [layer1, layer2], () => {
                setTimeout(() => {
                    expect(layerLoaded).toHaveBeenCalledTimes(0);
                    done();
                });
            });
        });
    });

    afterEach(() => {
        map.remove();
        document.body.removeChild(div);
    });
});
