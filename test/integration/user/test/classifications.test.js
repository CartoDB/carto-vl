import carto from '../../../../src/index';
import * as util from '../../util';

const aFeature = {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [0, 0] },
    properties: { wind_speed: 20, wind_direction: 350, category: 'station' }
};

describe('classifications with variables', () => {
    let div, map, source, viz, layer;

    function createMapWith (stringViz, features) {
        const setup = util.createMap('map');
        map = setup.map;
        div = setup.div;

        source = new carto.source.GeoJSON(features);
        viz = new carto.Viz(stringViz);

        layer = new carto.Layer('layer', source, viz);
        layer.addTo(map);
    }

    it('should work with static values (basic use case)', (done) => {
        const classificationViz = `
          color: ramp(globalQuantiles($wind_speed, 5), reverse(sunset))
        `;
        createMapWith(classificationViz, aFeature);
        layer.on('loaded', () => {
            done();
        });
    });

    describe('.same case using variables', () => {
        it('should allow variables to define the classification and ramp', (done) => {
            const classificationViz = `
              @value: $wind_speed
              @breaks: 5
              @ramp: reverse(sunset)
              color: ramp(globalQuantiles(@value, @breaks), @ramp)
            `;
            createMapWith(classificationViz, aFeature);
            layer.on('loaded', () => {
                done();
            });
        });
    });

    afterEach(() => {
        map.remove();
        document.body.removeChild(div);
    });
});
