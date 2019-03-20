import carto from '../../../../src/index';
import * as util from '../../util';
import { OTHERS_LABEL } from '../../../../src/renderer/viz/expressions/constants';

describe('sampleHistogram', () => {
    let div, map, source, viz, layer;

    function createFeature (id, value) {
        return {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [10, 12]
            },
            properties: {
                id,
                value
            }
        };
    }

    function createMapWith (stringViz, features) {
        const setup = util.createMap('map');
        map = setup.map;
        div = setup.div;

        const fakeFeatures = {
            type: 'FeatureCollection',
            features
        };

        source = new carto.source.GeoJSON(fakeFeatures);
        viz = new carto.Viz(stringViz);
        layer = new carto.Layer('layer', source, viz);
        layer.addTo(map);
    }

    const categoryFeatures = [
        createFeature(1, 'Murcia'),
        createFeature(2, 'Murcia'),
        createFeature(3, 'Murcia'),
        createFeature(4, 'Murcia'),
        createFeature(5, 'Murcia'),
        createFeature(6, 'Madrid'),
        createFeature(7, 'Madrid'),
        createFeature(8, 'Pontevedra'),
        createFeature(9, 'Barcelona'),
        createFeature(10, 'Barcelona'),
        createFeature(11, 'Barcelona'),
        createFeature(12, 'Barcelona')
    ];

    const numericFeatures = [
        createFeature(1, 0),
        createFeature(2, 10),
        createFeature(3, 15),
        createFeature(4, 20),
        createFeature(5, 25),
        createFeature(6, 30),
        createFeature(7, 55),
        createFeature(8, 74),
        createFeature(9, 75),
        createFeature(10, 80),
        createFeature(11, 90),
        createFeature(12, 100)
    ];

    it('should get correct data with categorical values', (done) => {
        const histogramViz = '@histogram: sampleHistogram($value)';

        createMapWith(histogramViz, categoryFeatures);

        layer.on('loaded', () => {
            const histogram = viz.variables.histogram.value;

            expect(histogram).toEqual([
                { x: 'Murcia', y: 5 },
                { x: 'Barcelona', y: 4 },
                { x: 'Madrid', y: 2 },
                { x: 'Pontevedra', y: 1 }
            ]);
            done();
        });
    });

    it('should get correct data with categorical values in buckets', (done) => {
        const top = 1;
        const histogramViz = `@histogram: sampleHistogram(top($value, ${top}))`;
        createMapWith(histogramViz, categoryFeatures);

        layer.on('loaded', () => {
            const histogram = viz.variables.histogram.value;
            expect(histogram).toEqual([
                { x: OTHERS_LABEL, y: 7 },
                { x: 'Murcia', y: 5 }
            ]);
            done();
        });
    });

    it('should get correct data with numeric values', (done) => {
        const size = 4;
        const min = 0;
        const max = 100;
        const histogramViz = `@histogram: sampleHistogram($value, ${size})`;
        createMapWith(histogramViz, numericFeatures);

        layer.on('loaded', () => {
            const histogram = viz.variables.histogram.value;

            expect(histogram).toEqual([
                { x: [min, 25], y: 4 },
                { x: [25, 50], y: 2 },
                { x: [50, 75], y: 2 },
                { x: [75, max], y: 4 }
            ]);
            done();
        });
    });

    it('should get correct data labeled when there are "others" values', (done) => {
        const top = 1;
        const histogramViz = `
            @histogram: sampleHistogram(top($value, ${top}))
            @color: ramp(top($value, ${top}), [ red, blue ], green )
        `;

        const options = {
            othersLabel: 'Others Test'
        };

        createMapWith(histogramViz, categoryFeatures);

        layer.on('loaded', () => {
            const colors = viz.variables.color.getLegendData(options).data;
            const histogram = viz.variables.histogram.getJoinedValues(colors, options);
            const GREEN_RGBA = { r: 0, g: 128, b: 0, a: 1 };
            const RED_RGBA = { r: 255, g: 0, b: 0, a: 1 };
            expect(histogram).toEqual([
                { key: 'Others Test', frequency: 7, value: GREEN_RGBA },
                { key: 'Murcia', frequency: 5, value: RED_RGBA }
            ]);
            done();
        });
    });

    afterEach(() => {
        map.remove();
        document.body.removeChild(div);
    });
});
