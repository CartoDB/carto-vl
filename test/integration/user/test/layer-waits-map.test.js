import carto from '../../../../src/';
import * as util from '../../util';
import mapboxgl from 'mapbox-gl';

const featureData = {
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [0, 0]
    },
    properties: {}
};

describe('when map is not ready', () => {
    let div, map;

    it('should wait for it load', (done) => {
        const name = 'map';
        div = util.createMapDivHolder(name);
        map = new mapboxgl.Map({
            container: name,
            center: [0, 0],
            zoom: 0
        });

        const source = new carto.source.GeoJSON(featureData);
        const layer = new carto.Layer('layer', source, new carto.Viz());

        const waitForMapToLoad = spyOn(layer, '_waitForMapToLoad').and.callThrough();
        layer.addTo(map, 'watername_ocean'); // << adding before setting basemap
        map.setStyle(carto.basemaps.voyager);

        layer.on('loaded', () => {
            setTimeout(() => {
                expect(waitForMapToLoad).toHaveBeenCalled();
                done();
            }, 0);
        });
    });

    afterEach(() => {
        map.remove();
        document.body.removeChild(div);
    });
});
