import * as carto from '../../../../src/';
import mapboxgl from '@carto/mapbox-gl';

describe('Layer', () => {
    const mapSize = 600;
    let source, viz, viz2, layer, map;

    beforeEach(() => {
        const setup = createMap('map');
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

    function createMap(name) {
        const div = document.createElement('div');
        div.id = name;
        div.style.margin = '0';
        div.style.width = `${mapSize}px`;
        div.style.height = `${mapSize}px`;
        document.body.appendChild(div);

        const map = new mapboxgl.Map({
            container: name,
            style: { version: 8, sources: {}, layers: [] },
            center: [0, 0],
            zoom: 0
        });

        return { div, map };
    }

    const featureJSON = {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [
                    [0, 0],
                    [50, 0],
                    [50, 50],
                    [0, 50],
                    [0, 0]
                ]
            ]
        },
        properties: {}
    };
});
