import * as carto from '../../../../src/';
import * as util from '../../util';

const featureData = {
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [0, 0]
    },
    properties: {}
};

fdescribe('Layer', () => {
    let div, map, source, viz, viz2, layer;

    beforeEach(() => {
        const setup = util.createMap('map');
        div = setup.div;
        map = setup.map;

        source = new carto.source.GeoJSON(featureData);
        viz = new carto.Viz(`
            @myColor: red
            color: @myColor
        `);
        viz2 = new carto.Viz(`
            color: blue
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
            var update = jasmine.createSpy('update');
            layer.on('updated', update);
            layer.on('loaded', () => {
                expect(update).toHaveBeenCalledTimes(1);
                expect(update).not.toHaveBeenCalledTimes(2);
                done();
            });
        });

        it('should fire a "updated" event when the source is updated', (done) => {
            var update = jasmine.createSpy('update');
            layer.on('updated', update);
            layer.on('loaded', async () => {
                await layer.update(new carto.source.GeoJSON(featureData), viz);
                layer.$paintCallback();
                expect(update).toHaveBeenCalledTimes(2);
                done();
            });
        });

        it('should fire a "updated" event when the viz is updated', (done) => {
            var update = jasmine.createSpy('update');
            layer.on('updated', update);
            layer.on('loaded', async () => {
                await layer.update(source, viz2);
                layer.$paintCallback();
                expect(update).toHaveBeenCalledTimes(2);
                done();
            });
        });

        it('should fire a "updated" event when the _onDataframeAdded is called', (done) => {
            var update = jasmine.createSpy('update');
            layer.on('updated', update);
            layer.on('loaded', () => {
                layer._onDataframeAdded(layer._source._dataframe);
                layer.$paintCallback();
                expect(update).toHaveBeenCalledTimes(2);
                done();
            });
        });
    });

    describe('.blendToViz', () => {
        it('should resolve the Promise with a valid viz', (done) => {
            layer.on('loaded', () => {
                layer.blendToViz(viz2).then(done);
            });
        });
    });

    afterEach(() => {
        document.body.removeChild(div);
    });
});
