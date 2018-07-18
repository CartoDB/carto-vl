import * as carto from '../../../../src';
import * as util from '../../util';

function checkFeatures (list, expectedList) {
    // FIXME: this shouldn't require list to have the same order as expected
    expect(list.length).toEqual(expectedList.length);

    for (let i = 0; i < list.length; ++i) {
        const actual = {};
        const expected = expectedList[i];

        Object.keys(expected).forEach(prop => {
            actual[prop] = list[i][prop];
        });

        expect(actual).toEqual(expected);
    }
}

const innerTriangle = {
    type: 'Feature',
    geometry: {
        type: 'Polygon',
        coordinates: [
            [ [0, 50], [0, 0], [50, 0], [0, 50] ]
        ]
    },
    properties: {
        cartodb_id: 1
    }
};

const intersectingTriangle = {
    type: 'Feature',
    geometry: {
        type: 'Polygon',
        coordinates: [
            [ [165, 50], [165, 0], [215, 0], [165, 50] ]
        ]
    },
    properties: {
        cartodb_id: 2
    }
};

const outerTriangle = {
    type: 'Feature',
    geometry: {
        type: 'Polygon',
        coordinates: [
            [ [200, 50], [200, 0], [250, 0], [200, 50] ]
        ]
    },
    properties: {
        cartodb_id: 3
    }
};

const outerBBOXTriangle = {
    type: 'Feature',
    geometry: {
        type: 'Polygon',
        coordinates: [
            [ [-225, -70], [-225, -85], [-175, -85], [-225, -70] ]
        ]
    },
    properties: {
        cartodb_id: 4
    }
};

function generateData (features) {
    return { type: 'FeatureCollection', features };
}

describe('viewportFeatures', () => {
    let map, viz1, viz2, layer1, layer2, source1, source2, setup;

    beforeEach(() => {
        const VIEWPORT_SIZE = 500;

        setup = util.createMap('map', VIEWPORT_SIZE);
        map = setup.map;

        source1 = new carto.source.GeoJSON(generateData(
            innerTriangle,
            intersectingTriangle,
            outerTriangle,
            outerBBOXTriangle
        ), { id: 'cartodb_id' });

        viz1 = new carto.Viz(`
          color: red,
          strokeWidth: 0,
          @list: viewportFeatures();
        `);

        layer1 = new carto.Layer('layer1', source1, viz1);
        layer1.addTo(map);

        source2 = new carto.source.GeoJSON(generateData(
            innerTriangle,
            intersectingTriangle
        ), { id: 'cartodb_id' });

        viz2 = new carto.Viz(`
          color: red,
          strokeWidth: 0,
          @list: viewportFeatures();
        `);

        layer2 = new carto.Layer('layer2', source2, viz2);
        layer2.addTo(map);
    });

    it('should get the features properties of one layer', done => {
        layer1.on('updated', () => {
            expect(viz1.variables.list.value.length).toEqual(2);
            done();
        });
    });

    it('should get the features properties of another layer', done => {
        layer2.on('updated', () => {
            const expectedAll = [
                { id: 1, value: 10, category: 'a' },
                { id: 2, value: 1000, category: 'b' }
            ];
            const expectedValue = [
                { value: 10 },
                { value: 1000 }
            ];
            checkFeatures(viz2.variables.list.eval(), expectedAll);
            checkFeatures(viz2.variables.list.eval(), expectedValue);
            done();
        });
    });

    afterEach((done) => {
        document.body.removeChild(setup.div);
        done();
    });
});

describe('viewportFeatures on a map with filters', () => {
    let map, source, viz, layer, source2, viz2, layer2, setup;

    beforeEach(() => {
        setup = util.createMap('map');
        map = setup.map;

        source = new carto.source.GeoJSON(generateData(
            innerTriangle,
            intersectingTriangle
        ), { id: 'cartodb_id' });

        viz = new carto.Viz(`
            @list: viewportFeatures($value,$category)
            filter: $value < 100
        `);

        layer = new carto.Layer('layer', source, viz);

        source2 = new carto.source.GeoJSON(generateData(
            innerTriangle,
            innerTriangle,
            intersectingTriangle
        ), { id: 'cartodb_id' });

        viz2 = new carto.Viz(`
            @list2all: viewportFeatures($value,$category,$id)
            @list2value: viewportFeatures($value)
            filter: $value > 10
        `);

        layer2 = new carto.Layer('layer2', source2, viz2);

        layer.addTo(map);
        layer2.addTo(map);
    });

    it('should get the filtered feature properties of one layer', done => {
        layer.on('updated', () => {
            const expected = [
                { value: 10, category: 'a' }
            ];
            checkFeatures(viz.variables.list.eval(), expected);
            done();
        });
    });

    it('should get the filtered feature properties of another layer', done => {
        layer2.on('updated', () => {
            const expectedAll = [
                { id: 2, value: 1000, category: 'b' }
            ];
            const expectedValue = [
                { value: 1000 }
            ];
            checkFeatures(viz2.variables.list2all.eval(), expectedAll);
            checkFeatures(viz2.variables.list2value.eval(), expectedValue);
            done();
        });
    });

    afterEach(() => {
        document.body.removeChild(setup.div);
    });
});

describe('viewportFeatures on a zoomed-in map', () => {
    let map, source, viz, layer, source2, viz2, layer2, setup;

    beforeEach(() => {
        setup = util.createMap('map');
        map = setup.map;
        map.setZoom(10);

        source = new carto.source.GeoJSON(generateData(
            innerTriangle,
            intersectingTriangle
        ), { id: 'cartodb_id' });

        viz = new carto.Viz(`
            @list: viewportFeatures($value,$category)
        `);
        layer = new carto.Layer('layer', source, viz);

        source2 = new carto.source.GeoJSON(generateData(
            innerTriangle,
            innerTriangle,
            intersectingTriangle
        ), { id: 'cartodb_id' });

        viz2 = new carto.Viz(`
            @list2all: viewportFeatures($value,$category,$id)
            @list2value: viewportFeatures($value)
        `);

        layer2 = new carto.Layer('layer2', source2, viz2);

        layer.addTo(map);
        layer2.addTo(map);
    });

    it('should get only in-viewport feature properties of one layer', done => {
        layer.on('updated', () => {
            const expected = [
                { value: 10, category: 'a' }
            ];
            checkFeatures(viz.variables.list.eval(), expected);
            done();
        });
    });

    it('should get only in-viewport features properties of another layer', done => {
        layer2.on('updated', () => {
            const expectedAll = [
                { id: 1, value: 10, category: 'a' }
            ];
            const expectedValue = [
                { value: 10 }
            ];
            checkFeatures(viz2.variables.list2all.eval(), expectedAll);
            checkFeatures(viz2.variables.list2value.eval(), expectedValue);
            done();
        });
    });

    afterEach(() => {
        document.body.removeChild(setup.div);
    });
});

describe('viewportFeatures with invalid parameters', () => {
    let map, source, viz, layer, setup;

    beforeEach(() => {
        setup = util.createMap('map');
        map = setup.map;

        source = new carto.source.GeoJSON(generateData(
            innerTriangle,
            innerTriangle,
            intersectingTriangle
        ), { id: 'cartodb_id' });

        viz = new carto.Viz(`
            @list: viewportFeatures($value,$category,11)
        `);
        layer = new carto.Layer('layer', source, viz);

        layer.addTo(map);
    });

    it('should fail with proper error', done => {
        expect(
            () => {
                // FIXME: this isn't nice (calling the private method _resetViewportAgg to force the check here)
                // but, how to avoid the exception happening asynchronously?
                viz.variables.list._resetViewportAgg();
            }
        ).toThrowError(/arguments can only be properties/);
        done();
    });

    afterEach(() => {
        map.remove();
        document.body.removeChild(setup.div);
    });
});
