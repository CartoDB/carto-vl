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

    // It passes fine on `test:user:watchc` but not with `test:user:min`
    xdescribe('regression with Interactivity (due to multiple feature pieces search)', () => {
        it('should work fine in a polygon Layer with custom featureId', done => {
            const metadata = { ...METADATA, idProperty: 'winner' };
            source = new carto.source.MVT(MVT_FILE, metadata);
            viz = new carto.Viz(`
                @f_cartodb_id: $cartodb_id
                @f_winner: $winner

                @v_features: viewportFeatures($winner)
                strokeWidth: 1
            `);
            layer = new carto.Layer('my_mvt_layer', source, viz);
            const interactivity = new carto.Interactivity(layer);
            layer.addTo(map);

            interactivity.on('featureClick', event => {
                expect(event.features.length).toBeGreaterThan(0);

                const aFeature = event.features[0];
                expect(aFeature.layerId).toEqual('my_mvt_layer');

                expect(aFeature.id).toBeDefined();
                expect(aFeature.variables.f_cartodb_id).toBeDefined();
                expect(aFeature.variables.f_winner).toBeDefined();

                done();
            });

            onLoaded(() => {
                util.simulateClick({ lng: 0, lat: 50 });
            });
        });
    });

    function onLoaded (callback) {
        layer.on('loaded', callback);
    }

    afterEach(() => {
        map.remove();
        document.body.removeChild(div);
    });
});
