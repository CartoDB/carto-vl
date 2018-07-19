import * as carto from '../../../../src/';
import * as util from '../../util';

describe('Layer', () => {
    let div, map, source, viz, layer;

    beforeEach(() => {
        const setup = util.createMap('map');
        div = setup.div;
        map = setup.map;
    });

    describe('viewportZoomToSourceZoom', () => {
        it('should return zoom levels consistent with MGL getZoom() method', done => {
            map.setZoom(12.345);
            source = new carto.source.MVT('/test/common/polygons.mvt', {
                properties: {
                    cartodb_id: {
                        type: 'number'
                    }
                },
                idProperty: 'cartodb_id'
            }, {
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
