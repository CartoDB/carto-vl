import * as carto from '../../../../src';
import * as util from '../../util';

describe('viewportFeatures', () => {
    let map, source1, viz1, layer1, source2, viz2, layer2, setup;

    beforeEach(() => {
        setup = util.createMap('map');
        map = setup.map;
    });

    describe('when there are no filters', () => {

        beforeEach(() => {
            source1 = new carto.source.GeoJSON(_features);
            viz1 = new carto.Viz(`
                @list: viewportFeatures($value,$category)
            `);
            layer1 = new carto.Layer('layer1', source1, viz1);

            source2 = new carto.source.GeoJSON(_features);
            viz2 = new carto.Viz(`
                @cat: $category
                @list2all: viewportFeatures($value,@cat,$id)
                @list2value: viewportFeatures($value)
            `);
            layer2 = new carto.Layer('layer2', source2, viz2);

            layer1.addTo(map);
            layer2.addTo(map);
        });

        it('should get the features properties of one layer', done => {
            layer1.on('updated', () => {
                const expected = [{ value: 10, category: 'a' }, { value: 1000, category: 'b' }];
                _checkFeatures(viz1.variables.list.eval(), expected, done);
            });
        });

        it('should get the features properties of another layer', done => {
            layer2.on('updated', () => {
                const expectedAll = [{ id: 1, value: 10, category: 'a' }, { id: 2, value: 1000, category: 'b' }];
                const expectedValue = [{ value: 10 }, { value: 1000 }];
                _checkFeatures(viz2.variables.list2all.eval(), expectedAll);
                _checkFeatures(viz2.variables.list2value.eval(), expectedValue, done);
            });
        });
    });

    describe('when there are filters', () => {
        beforeEach(() => {
            source1 = new carto.source.GeoJSON(_features);
            viz1 = new carto.Viz(`
                @list: viewportFeatures($value,$category)
                filter: $value < 100
            `);
            layer1 = new carto.Layer('layer1', source1, viz1);

            source2 = new carto.source.GeoJSON(_features);
            viz2 = new carto.Viz(`
                @list2all: viewportFeatures($value,$category,$id)
                @list2value: viewportFeatures($value)
                filter: $value > 10
            `);
            layer2 = new carto.Layer('layer2', source2, viz2);

            layer1.addTo(map);
            layer2.addTo(map);
        });

        it('should get the filtered feature properties of one layer', done => {
            layer1.on('updated', () => {
                const expected = [{ value: 10, category: 'a' }];
                _checkFeatures(viz1.variables.list.eval(), expected);
                done();
            });
        });

        it('should get the filtered feature properties of another layer', done => {
            layer2.on('updated', () => {
                const expectedAll = [{ id: 2, value: 1000, category: 'b' }];
                const expectedValue = [{ value: 1000 }];
                _checkFeatures(viz2.variables.list2all.eval(), expectedAll);
                _checkFeatures(viz2.variables.list2value.eval(), expectedValue);
                done();
            });
        });
    });

    describe('when the map has category filters', () => {
        beforeEach(() => {
            source1 = new carto.source.GeoJSON(_features);
            viz1 = new carto.Viz(`
                @list: viewportFeatures($value,$category)
                filter: in($category, ['a'])
            `);

            layer1 = new carto.Layer('layer1', source1, viz1);
            layer1.addTo(map);
        });

        it('should return the right list of features', done => {
            layer1.on('updated', () => {
                const expected = [{ value: 10, category: 'a' }];
                _checkFeatures(viz1.variables.list.value, expected, done);
            });
        });
    });

    describe('when the map is on a zoomed-in', () => {
        beforeEach(() => {
            map.setZoom(10);

            source1 = new carto.source.GeoJSON(_features);
            viz1 = new carto.Viz(`
                @list: viewportFeatures($value,$category)
            `);
            layer1 = new carto.Layer('layer1', source1, viz1);

            source2 = new carto.source.GeoJSON(_features);
            viz2 = new carto.Viz(`
                @list2all: viewportFeatures($value,$category,$id)
                @list2value: viewportFeatures($value)
            `);
            layer2 = new carto.Layer('layer2', source2, viz2);

            layer1.addTo(map);
            layer2.addTo(map);
        });

        it('should get only in-viewport feature properties of one layer', done => {
            layer1.on('updated', () => {
                const expected = [{ value: 10, category: 'a' }];
                _checkFeatures(viz1.variables.list.eval(), expected, done);
            });
        });

        it('should get only in-viewport features properties of another layer', done => {
            layer2.on('updated', () => {
                const expectedAll = [{ id: 1, value: 10, category: 'a' }];
                const expectedValue = [{ value: 10 }];
                _checkFeatures(viz2.variables.list2all.eval(), expectedAll);
                _checkFeatures(viz2.variables.list2value.eval(), expectedValue, done);
            });
        });
    });

    afterEach(() => {
        document.body.removeChild(setup.div);
    });
});

// TEST HELPERS

function _checkFeatures(list, expectedList, done) {
    // FIXME: this shouldn't require list to have the same order as expected
    expect(list.length).toEqual(expectedList.length);
    for (let i = 0; i < list.length; ++i) {
        const actual = {};
        const expected = expectedList[i];
        Object.keys(expected).forEach(prop => actual[prop] = list[i][prop]);
        expect(actual).toEqual(expected);
    }
    done && done();
}

const _feature1 = {
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

const _feature2 = {
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [10, 12],
    },
    properties: {
        id: 2,
        value: 1000,
        category: 'b'
    }
};

const _features = {
    type: 'FeatureCollection',
    features: [_feature1, _feature2]
};
