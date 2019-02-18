import carto from '../../../../src/index';
import * as util from '../../util';
// import { OTHERS_INDEX } from '../../../../src/renderer/viz/expressions/constants';
// import Metadata from '../../../../src/renderer/Metadata';

describe('globalHistogram', () => {
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
        createFeature(1, 100),
        createFeature(2, 20),
        createFeature(3, 30),
        createFeature(4, 20),
        createFeature(5, 0),
        createFeature(6, 80),
        createFeature(7, 60),
        createFeature(8, 90),
        createFeature(9, 70),
        createFeature(10, 100),
        createFeature(11, 40),
        createFeature(12, 20)
    ];

    it('should get correct data with categorical values', (done) => {
        const histogramViz = '@histogram: globalHistogram($value)';

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

    it('should get correct data with numeric values', (done) => {
        const size = 4;
        const min = 0;
        const max = 100;
        const histogramViz = `@histogram: globalHistogram($value, ${size})`;
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

    it('should get correct data with numeric values in buckets', (done) => {
        const top = 2;
        const histogramViz = `@histogram: globalHistogram(top($value, ${top}))`;
        createMapWith(histogramViz, numericFeatures);

        layer.on('loaded', () => {
            const histogram = viz.variables.histogram.value;

            expect(histogram).toEqual([
                { x: [0, 25], y: 4 },
                { x: [25, 50], y: 2 }
            ]);
            done();
        });
    });

    afterEach(() => {
        map.remove();
        document.body.removeChild(div);
    });
});
