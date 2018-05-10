import * as carto from '../../../../src/';
import * as util from '../../util';

describe('BaseExpression', () => {
    let source, div, viz, layer, map;

    beforeEach(() => {
        const setup = util.createMap('map');
        map = setup.map;
        div = setup.div;

        source = new carto.source.GeoJSON(featureJSON);
        viz = new carto.Viz('@var1: 0.5');

        layer = new carto.Layer('layer', source, viz);
        layer.addTo(map);
    });

    describe('.blendTo', () => {
        it('should resolve the Promise with a valid viz', (done) => {
            layer.on('loaded', () => {
                viz.filter.blendTo(carto.expressions.var('var1'));
                done();
            });
        });
    });

    afterEach(() => {
        document.body.removeChild(div);
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
