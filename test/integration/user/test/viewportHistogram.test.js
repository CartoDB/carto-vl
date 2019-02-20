import carto from '../../../../src/index';
import * as util from '../../util';
import { OTHERS_INDEX } from '../../../../src/renderer/viz/expressions/constants';

describe('viewportHistogram', () => {
    let div, map, source, viz, layer;

    // Some useful features
    const feature1 = {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [0, 0]
        },
        properties: {
            id: 1,
            value: 10,
            category: 'a'
        }
    };
    const feature2 = {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [10, 12]
        },
        properties: {
            id: 2,
            value: 1000,
            category: 'a'
        }
    };
    const feature3 = {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [10, 12]
        },
        properties: {
            id: 3,
            value: 1000,
            category: 'b'
        }
    };
    const featureWithNullCategory = {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [10, 12]
        },
        properties: {
            id: 4,
            value: 1000,
            category: null
        }
    };
    const featureWithEmptyStringCategory = {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [10, 12]
        },
        properties: {
            id: 5,
            value: 1000,
            category: ''
        }
    };
    const featureWithUndefinedCategory = {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [10, 12]
        },
        properties: {
            id: 6,
            value: 1000
        }
    };

    function createMapWith (stringViz, features) {
        const setup = util.createMap('map');
        map = setup.map;
        div = setup.div;

        source = new carto.source.GeoJSON(features);
        viz = new carto.Viz(stringViz);

        layer = new carto.Layer('layer', source, viz);
        layer.addTo(map);
    }

    const commonFeatures = {
        type: 'FeatureCollection',
        features: [feature1, feature2, feature3]
    };

    it('common use case', (done) => {
        const histogramViz = '@histogram: viewportHistogram($category)';
        createMapWith(histogramViz, commonFeatures);

        layer.on('loaded', () => {
            const histogram = viz.variables.histogram.value;
            expect(histogram).toEqual([
                { x: 'a', y: 2 },
                { x: 'b', y: 1 }
            ]);
            done();
        });
    });

    it('with nulls & undefined categories', (done) => {
        const featuresWithSomeNulls = {
            type: 'FeatureCollection',
            features: [feature1, feature2, feature3,
                featureWithNullCategory, featureWithEmptyStringCategory, featureWithUndefinedCategory]
        };

        const histogramViz = '@histogram: viewportHistogram($category)';
        createMapWith(histogramViz, featuresWithSomeNulls);

        layer.on('loaded', () => {
            const histogram = viz.variables.histogram.value;
            expect(histogram).toEqual([
                { x: 'a', y: 2 },
                { x: null, y: 2 },
                { x: 'b', y: 1 },
                { x: '', y: 1 }
            ]);
            done();
        });
    });

    it('with top()', (done) => {
        const histogramViz = '@histogram: viewportHistogram(top($category, 1))';
        createMapWith(histogramViz, commonFeatures);

        const TOP_ONE_CATEGORY = 0; // category: 'a'

        layer.on('loaded', () => {
            const histogram = viz.variables.histogram.value;
            expect(histogram).toEqual([
                { x: TOP_ONE_CATEGORY, y: 2 },
                { x: OTHERS_INDEX, y: 1 }
            ]);
            done();
        });
    });

    afterEach(() => {
        map.remove();
        document.body.removeChild(div);
    });
});
