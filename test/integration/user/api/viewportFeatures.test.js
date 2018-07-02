import * as carto from '../../../../src';
import * as util from '../../util';

// More info: https://github.com/CartoDB/carto-vl/wiki/Interactivity-tests

const feature1 = {
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [0, 0],
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
        coordinates: [10,12],
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
    let map, source1, viz1, layer1, source2, viz2, layer2;

    beforeEach(() => {
        const setup = util.createMap('map');
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

    it ('should get the features properties of another layer', done => {
        layer2.on('updated', () => {
            const expectedAll = [
                { id: 1, value: 10, category: 'a'},
                { id: 2, value: 1000, category: 'b'}
            ];
            const expectedValue = [
                { value: 10 },
                { value: 1000 }
            ];
            expect(viz2.variables.list2all.eval()).toEqual(expectedAll);
            expect(viz2.variables.list2value.eval()).toEqual(expectedValue);
            done();
        });
    });

    it ('should return an error if viewportFeatures arguments are not all properties', done => {
        const s = carto.expressions;
        expect(
            () => s.viewportFeatures(s.prop('id'), s.constant(11))
        ).toThrowError(/arguments can only be properties/);
        done();
    });
});

describe('viewportFeatures on a map with filters', () => {
    let map, source1, viz1, layer1, source2, viz2, layer2;

    beforeEach(() => {
        const setup = util.createMap('map');
        map = setup.map;

        source1 = new carto.source.GeoJSON(features);
        viz1 = new carto.Viz(`
            @list: viewportFeatures($value,$category)
            filter: $value < 100
        `);
        layer1 = new carto.Layer('layer1', source1, viz1);

        source2 = new carto.source.GeoJSON(features);
        viz2 = new carto.Viz(`
            @list2all: viewportFeatures($value,$category,$id)
            @list2value: viewportFeatures($value)
            filter: $value > 10
        `);
        layer2 = new carto.Layer('layer2', source2, viz2);

        layer1.addTo(map);
        layer2.addTo(map);
    });

    it ('should get the filtered feature properties of one layer', done => {
        layer1.on('updated', () => {
            const expected = [
                { value: 10, category: 'a'}
            ];
            expect(viz1.variables.list.eval()).toEqual(expected);
            done();
        });
    });

    it ('should get the fileered feature properties of another layer', done => {
        layer2.on('updated', () => {
            const expectedAll = [
                { id: 2, value: 1000, category: 'b'}
            ];
            const expectedValue = [
                { value: 1000 }
            ];
            expect(viz2.variables.list2all.eval()).toEqual(expectedAll);
            expect(viz2.variables.list2value.eval()).toEqual(expectedValue);
            done();
        });
    });
});


describe('viewportFeatures on a zoomed-in map', () => {
    let map, source1, viz1, layer1, source2, viz2, layer2;

    beforeEach(() => {
        const setup = util.createMap('map');
        map = setup.map;
        map.setZoom(10);

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

    it ('should get only in-viewport feature properties of one layer', done => {
        layer1.on('updated', () => {
            const expected = [
                { value: 10, category: 'a'}
            ];
            expect(viz1.variables.list.eval()).toEqual(expected);
            done();
        });
    });

    it ('should get only in-viewport features properties of another layer', done => {
        layer2.on('updated', () => {
            const expectedAll = [
                { id: 1, value: 10, category: 'a'}
            ];
            const expectedValue = [
                { value: 10 }
            ];
            expect(viz2.variables.list2all.eval()).toEqual(expectedAll);
            expect(viz2.variables.list2value.eval()).toEqual(expectedValue);
            done();
        });
    });
});
