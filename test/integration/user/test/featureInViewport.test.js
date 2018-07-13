import * as carto from '../../../../src';
import features0 from './data/features-0';
import features1 from './data/features-1';
import mapboxgl from '@carto/mapbox-gl';

fdescribe('viewport features', () => {
    describe('given a list of features', () => {
        describe('when the viewport is in a predefined place (center/zoom)', () => {
            let map, source, viz, layer, div;
            beforeEach(() => {
                div = document.createElement('div');
                div.id = 'map';
                div.style.width = '500px';
                div.style.height = '500px';
                div.style.position = 'absolute';
                document.body.style.margin = '0';
                document.body.style.padding = '0';
                document.body.appendChild(div);

                window.map = map = new mapboxgl.Map({
                    container: 'map',
                    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
                    center: [-9.886941182470537, 20.96696256294605],
                    zoom: 3.5917036363401382,
                });
            });

            it('should correctly detect features inside viewport', done => {
                // Define layer
                source = new carto.source.GeoJSON(features0);
                viz = new carto.Viz(`
                    @list: viewportFeatures();
                `);
                layer = new carto.Layer('layer', source, viz);
                layer.addTo(map, 'watername_ocean');
                layer.on('loaded', () => {
                    expect(viz.variables.list.value.length).toEqual(9);
                    done();
                });
            });

            fit('should be aware of features whose bbox collides but not colliding', done => {
                // Define layer
                source = new carto.source.GeoJSON(features1);
                viz = new carto.Viz(`
                    @list: viewportFeatures();
                `);
                layer = new carto.Layer('layer', source, viz);
                layer.addTo(map, 'watername_ocean');

                layer.on('loaded', () => {
                    expect(viz.variables.list.value.length).toEqual(0);
                    done();
                });
            });

            // afterEach(() => {
            //     document.body.removeChild(div);
            // });
        });
    });
});
