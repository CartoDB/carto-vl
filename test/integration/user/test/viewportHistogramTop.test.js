import carto from '../../../../src/index';
import * as util from '../../util';
import { OTHERS_LABEL, OTHERS_INDEX } from '../../../../src/renderer/viz/expressions/constants';

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
        id: 2,
        value: 1000,
        category: 'b'
    }
};

const features = {
    type: 'FeatureCollection',
    features: [feature1, feature2, feature3]
};

describe('viewportHistogram() with top()', () => {
    let div, map, source, viz, layer;

    beforeEach(() => {
        const setup = util.createMap('map');
        map = setup.map;
        div = setup.div;

        source = new carto.source.GeoJSON(features);
        viz = new carto.Viz('@histogram: viewportHistogram(top($category, 1))');

        layer = new carto.Layer('layer', source, viz);
        layer.addTo(map);
    });

    it('should return the valid histogram', (done) => {
        layer.on('loaded', () => {
            expect(viz.variables.histogram.value).toEqual([
                { x: 0, y: 2 },
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
