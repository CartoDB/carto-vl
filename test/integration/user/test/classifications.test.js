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
                      @input: $wind_speed
                      @buckets: 5
                      @palette: prism
                      color: ramp(globalEqIntervals(@input, @buckets), @palette)
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
                      @input: $wind_speed
                      @buckets: 5
                      @palette: reverse(sunset)
                      color: ramp(globalQuantiles(@input, @buckets), @palette)
                    `;
                createMapWith(classificationViz, featureCollection);
                layer.on('loaded', () => {
                    done();
                });
            });
        });

        describe('.globalStandardDev', () => {
            it('.control (static values)', (done) => {
                const viz = `
                  color: ramp(globalStandardDev($wind_speed, 5, 0.5), tealrose)
                `;
                createMapWith(viz, featureCollection);
                layer.on('loaded', () => {
                    done();
                });
            });

            it('should allow variables in a ramp', (done) => {
                const classificationViz = `
                      @input: $wind_speed
                      @buckets: 5
                      @classSize: 0.5
                      @palette: tealrose
                      color: ramp(globalStandardDev(@input, @buckets, @classSize), @palette)
                    `;
                createMapWith(classificationViz, featureCollection);
                layer.on('loaded', () => {
                    done();
                });
            });
        });
    });

    describe('.viewport classifiers', () => {
        describe('.viewportEqIntervals', () => {
            it('.control (static values)', (done) => {
                const viz = `
                  color: ramp(viewportEqIntervals($wind_speed, 5), sunset)
                `;
                createMapWith(viz, featureCollection);
                layer.on('loaded', () => {
                    done();
                });
            });

            it('should allow variables in a ramp', (done) => {
                const classificationViz = `
                      @input: $wind_speed
                      @buckets: 5
                      @palette: sunset
                      color: ramp(viewportEqIntervals(@input, @buckets), @palette)
                    `;
                createMapWith(classificationViz, featureCollection);
                layer.on('loaded', () => {
                    done();
                });
            });
        });

        describe('.viewportQuantiles', () => {
            it('.control (static values)', (done) => {
                const viz = `
                  color: ramp(viewportQuantiles($wind_speed, 5, 1000), sunset)
                `;
                createMapWith(viz, featureCollection);
                layer.on('loaded', () => {
                    done();
                });
            });

            it('should allow variables in a ramp', (done) => {
                const classificationViz = `
                      @input: $wind_speed
                      @buckets: 5
                      @histogramSize: 1000
                      @palette: sunset
                      color: ramp(viewportQuantiles(@input, @buckets, @histogramSize), @palette)
                    `;
                createMapWith(classificationViz, featureCollection);
                layer.on('loaded', () => {
                    done();
                });
            });
        });

        describe('.viewportStandardDev', () => {
            it('.control (static values)', (done) => {
                const viz = `
                  color: ramp(viewportStandardDev($wind_speed, 5, 1.0, 1000), sunset)
                `;
                createMapWith(viz, featureCollection);
                layer.on('loaded', () => {
                    done();
                });
            });

            it('should allow variables in a ramp', (done) => {
                const classificationViz = `
                      @input: $wind_speed
                      @buckets: 5
                      @classSize: 1.0
                      @histogramSize: 1000
                      @palette: sunset
                      color: ramp(viewportStandardDev(@input, @buckets, @classSize, @histogramSize), @palette)
                    `;
                createMapWith(classificationViz, featureCollection);
                layer.on('loaded', () => {
                    done();
                });
            });
        });
    });

    afterEach(() => {
        map.remove();
        document.body.removeChild(div);
    });
});
