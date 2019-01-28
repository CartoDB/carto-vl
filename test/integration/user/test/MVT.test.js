import carto from '../../../../src/';
import * as util from '../../util';

describe('Layer', () => {
    let div, map, source, viz, layer;

    const METADATA = {
        properties: {
            cartodb_id: { type: 'number' },
            winner: { type: 'category' }
        },
        idProperty: 'cartodb_id'
    };

    const MVT_FILE = '/base/test/data/5_15_10.mvt';

    beforeEach(() => {
        const setup = util.createMap('map');
        div = setup.div;
        map = setup.map;
    });

    describe('viewportZoomToSourceZoom', () => {
        it('should return zoom levels consistent with MGL getZoom() method', done => {
            map.setZoom(12.345);
            source = new carto.source.MVT(MVT_FILE, METADATA, {
                viewportZoomToSourceZoom: zoom => {
                    expect(zoom).toEqual(12.345);
                    done();
                }
            });
            viz = new carto.Viz();
            layer = new carto.Layer('layer', source, viz);
            layer.addTo(map);
        });
    });

    afterEach(() => {
        map.remove();
        document.body.removeChild(div);
    });
});
