import carto from '../../../../src/index';
import * as util from '../../util';

const featureCollection = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: { wind_speed: 20, wind_direction: 350, category: 'station' }
        }
    ]
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

    describe('.global classifiers', () => {
        describe('.globalEqIntervals', () => {
            it('.control (static values)', (done) => {
                const viz = `
                  color: ramp(globalEqIntervals($wind_speed, 5), prism)
                `;
                createMapWith(viz, featureCollection);
                layer.on('loaded', () => {
                    done();
                });
            });

            it('should allow variables in a ramp', (done) => {
                const classificationViz = `
                      @value: $wind_speed
                      @breaks: 5
                      @palette: prism
                      color: ramp(globalEqIntervals(@value, 5), @palette)
                    `;
                createMapWith(classificationViz, featureCollection);
                layer.on('loaded', () => {
                    done();
                });
            });
        });

        describe('.globalQuantiles', () => {
            it('.control (static values)', (done) => {
                const viz = `
                  color: ramp(globalQuantiles($wind_speed, 5), reverse(sunset))
                `;
                createMapWith(viz, featureCollection);
                layer.on('loaded', () => {
                    done();
                });
            });

            it('should allow variables in a ramp', (done) => {
                const classificationViz = `
                      @value: $wind_speed
                      @breaks: 5
                      @palette: reverse(sunset)
                      color: ramp(globalQuantiles(@value, @breaks), @palette)
                    `;
                createMapWith(classificationViz, featureCollection);
                layer.on('loaded', () => {
                    done();
                });
            });
        });

        // describe('.globalStandardDev', () => {
        //     it('.control (static values)', (done) => {
        //         const viz = `
        //           color: ramp(globalStandardDev($wind_speed, 5), tealrose)
        //         `;
        //         createMapWith(viz, featureCollection);
        //         layer.on('loaded', () => {
        //             done();
        //         });
        //     });

        //     it('should allow variables in a ramp', (done) => {
        //         const classificationViz = `
        //               @value: $wind_speed * 3
        //               // @breaks: 5
        //               @palette: tealrose
        //               color: ramp(globalStandardDev(@value, 5), @palette)
        //             `;
        //         createMapWith(classificationViz, featureCollection);
        //         layer.on('loaded', () => {
        //             done();
        //         });
        //     });
        // });
    });

    // describe('.viewport classifiers', () => {
    //     describe('.viewportEqIntervals', () => {

    //     });

    //     describe('.viewportQuantiles', () => {

    //     });

    //     describe('.viewportStandardDev', () => {

    //     });
    // });

    afterEach(() => {
        map.remove();
        document.body.removeChild(div);
    });
});
