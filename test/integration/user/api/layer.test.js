import * as carto from '../../../../src/';
import * as util from '../../util';

describe('Layer', () => {
    let source, viz, viz2, layer, map;

    beforeEach(() => {
        const setup = util.createMap('map');
        map = setup.map;

        source = new carto.source.GeoJSON(featureJSON);
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

    describe('.blendToViz', () => {
        it('should resolve the Promise with a valid viz', (done) => {
            layer.on('loaded', () => {
                layer.blendToViz(viz2).then(done);
            });
        });
    });

    const featureJSON = {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [0, 0]
        },
        properties: {}
    };
});
