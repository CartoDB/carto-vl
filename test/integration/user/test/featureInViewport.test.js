import * as carto from '../../../../src';
import features from './features';
import mapboxgl from '@carto/mapbox-gl';

describe('viewport features', () => {
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

                map = new mapboxgl.Map({
                    container: 'map',
                    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
                    center: [-6.754536880813703, 35.30378023840868],
                    zoom: 3.29,
                });

                // Define layer
                source = new carto.source.GeoJSON(features);
                viz = new carto.Viz(`
                    @list: viewportFeatures();
                `);
                layer = new carto.Layer('layer', source, viz);
            });
           
            it('should correctly detect features inside viewport', done => {
                layer.addTo(map, 'watername_ocean');
                layer.on('loaded', () => {
                    expect(viz.variables.list.value.length).toEqual(5);
                    done();
                });
            });

            afterEach(() => {
                document.body.removeChild(div);
            });
        });
    });
});
