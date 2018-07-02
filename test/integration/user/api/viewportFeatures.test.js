import * as carto from '../../../../src';
import * as util from '../../util';

// More info: https://github.com/CartoDB/carto-vl/wiki/Interactivity-tests

const feature1 = {
    type: 'Feature',
    geometry: {
        type: 'Polygon',
        coordinates: [
            [
                [0, 0],
                [40, 0],
                [40, 40],
                [0, 40],
                [0, 0]
            ],
            [
                [10, 10],
                [10, 30],
                [30, 30],
                [30, 10],
                [10, 10]
            ]
        ]
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
        type: 'Polygon',
        coordinates: [
            [
                [20, 20],
                [60, 20],
                [60, 60],
                [20, 60],
                [20, 20]
            ]
        ]
    },
    properties: {
        id: 2,
        value: 1000,
        category: 'b'
    }
};

const features = {
    type: 'FeatureCollection',
    features: [ feature1, feature2 ]
};

describe('viewportFeatures', () => {
    let div, map, source1, viz1, layer1, source2, viz2, layer2, interactivity;

    beforeEach(() => {
        const setup = util.createMap('map');
        div = setup.div;
        map = setup.map;

        source1 = new carto.source.GeoJSON(features);
        viz1 = new carto.Viz(`
            @list: viewportFeatures($value,$category)
        `);
        layer1 = new carto.Layer('layer1', source1, viz1);

        source2 = new carto.source.GeoJSON(features);
        viz2 = new carto.Viz(`
            @list2all: viewportFeatures($value,$category,$id)
            @list2value: viewportFeatures($value)
        `);
        layer2 = new carto.Layer('layer2', source2, viz2);

        layer1.addTo(map);
        layer2.addTo(map);
    });

    it ('should get the features properties of one layer', done => {
        layer1.on('updated', () => {
            const expected = [
                { value: 10, category: 'a'},
                { value: 1000, category: 'b'}
            ];
            expect(viz1.variables.list.eval()).toEqual(expected);
            done();
        });
    });

    // TODO:
    // * check other layer listss
    // * no filtered out features
    // * no out of viewport features
    // * error on non-property argument
    // * error if used in viz
});
