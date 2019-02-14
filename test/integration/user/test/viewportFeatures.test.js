import carto from '../../../../src';
import * as util from '../../util';
import VIZ_PROPERTIES from '../../../../src/renderer/viz/utils/properties';
import { CLUSTER_FEATURE_COUNT } from '../../../../src/renderer/schema';

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
        category: 'b'
    }
};

const features = {
    type: 'FeatureCollection',
    features: [feature1, feature2]
};

const aggregationFeatures = {
    type: 'FeatureCollection',
    features: [{
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [10, 12]
        },
        properties: {
            id: 1,
            value: 1000,
            _cdb_feature_count: 2
        }
    }]
};

function checkFeatures (featureList, expectedList) {
    // FIXME: this shouldn't require list to have the same order as expected
    expect(featureList.length).toEqual(expectedList.length);
    for (let i = 0; i < featureList.length; ++i) {
        const actual = {};
        const expected = expectedList[i];
        Object.keys(expected).forEach(prop => {
            actual[prop] = featureList[i].properties[prop];
        });
        expect(actual).toEqual(expected);
    }
}

function generatePolygonsDataset () {
    const innerTriangle = {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [[0, 50], [0, 0], [50, 0], [0, 50]]
            ]
        },
        properties: {
            cartodb_id: 1,
            value: 1,
            category: 'a'
        }
    };

    const intersectingTriangle = {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [[165, 50], [165, 0], [215, 0], [165, 50]]
            ]
        },
        properties: {
            cartodb_id: 2,
            value: 2,
            category: 'b'
        }
    };

    const outerTriangle = {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [[200, 50], [200, 0], [250, 0], [200, 50]]
            ]
        },
        properties: {
            cartodb_id: 3,
            value: 3,
            category: 'c'
        }
    };

    const outerBBOXTriangle = {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [[-226, -70], [-226, -85], [-176, -85], [-226, -70]]
            ]
        },
        properties: {
            cartodb_id: 4,
            value: 4,
            category: 'd'
        }
    };

    const features = [
        innerTriangle,
        intersectingTriangle,
        outerTriangle,
        outerBBOXTriangle
    ];

    return { type: 'FeatureCollection', features };
}

describe('viewportFeatures', () => {
    let map, source1, viz1, layer1, source2, viz2, layer2, setup;

    beforeEach(() => {
        setup = util.createMap('map');
        map = setup.map;

        source1 = new carto.source.GeoJSON(features);
        viz1 = new carto.Viz(`
            @list: viewportFeatures($value,$category)
        `);
        layer1 = new carto.Layer('layer1', source1, viz1);

        source2 = new carto.source.GeoJSON(features);
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
        layer1.on('loaded', () => {
            const expected = [
                { value: 10, category: 'a' },
                { value: 1000, category: 'b' }
            ];
            checkFeatures(viz1.variables.list.eval(), expected);
            done();
        });
    });

    it('should get the features properties of another layer', done => {
        layer2.on('loaded', () => {
            const expectedAll = [
                { id: 1, value: 10, cat: 'a' },
                { id: 2, value: 1000, cat: 'b' }
            ];
            const expectedValue = [
                { value: 10 },
                { value: 1000 }
            ];
            checkFeatures(viz2.variables.list2all.eval(), expectedAll);
            checkFeatures(viz2.variables.list2value.eval(), expectedValue);
            done();
        });
    });

    it('should get interactivity-like features, with vizProperties', done => {
        layer1.on('loaded', () => {
            // 1. keep required properties
            const expected = [
                { value: 10, category: 'a' },
                { value: 1000, category: 'b' }
            ];
            const featureList = viz1.variables.list.eval();
            checkFeatures(featureList, expected);

            // 2. and featureVizProperties / variables are available
            featureList.forEach(feature => {
                VIZ_PROPERTIES.forEach(propertyName => {
                    expect(feature[propertyName]).toBeTruthy();
                });
                expect(feature['variables']).toBeTruthy();
            });
            done();
        });
    });

    it('should have a working getRenderedCentroid method', done => {
        layer1.on('loaded', () => {
            const featureList = viz1.variables.list.eval();
            const [[x1, y1], [x2, y2]] = featureList.map(f => {
                return f.getRenderedCentroid();
            });

            expect(x1).toBeCloseTo(0, 6);
            expect(y1).toBeCloseTo(0, 6);

            expect(x2).toBeCloseTo(10, 6);
            expect(y2).toBeCloseTo(12, 6);

            done();
        });
    });

    afterEach(() => {
        map.remove();
        document.body.removeChild(setup.div);
    });
});

describe('viewportFeatures on a map with filters', () => {
    let map, source1, viz1, layer1, source2, viz2, layer2, setup;

    beforeEach(() => {
        setup = util.createMap('map');
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

    it('should get the filtered feature properties of one layer', done => {
        layer1.on('loaded', () => {
            const expected = [
                { value: 10, category: 'a' }
            ];
            checkFeatures(viz1.variables.list.eval(), expected);
            done();
        });
    });

    it('should get the filtered feature properties of another layer', done => {
        layer2.on('loaded', () => {
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
        map.remove();
        document.body.removeChild(setup.div);
    });
});

describe('viewportFeatures on a zoomed-in map', () => {
    let map, source1, viz1, layer1, source2, viz2, layer2, setup;

    beforeEach(() => {
        setup = util.createMap('map');
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

    it('should get only in-viewport feature properties of one layer', done => {
        layer1.on('loaded', () => {
            const expected = [
                { value: 10, category: 'a' }
            ];
            checkFeatures(viz1.variables.list.eval(), expected);
            done();
        });
    });

    it('should get only in-viewport features properties of another layer', done => {
        layer2.on('loaded', () => {
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
        map.remove();
        document.body.removeChild(setup.div);
    });
});

describe('viewportFeatures with invalid parameters', () => {
    let map, source, viz, layer, setup;

    beforeEach(() => {
        setup = util.createMap('map');
        map = setup.map;

        source = new carto.source.GeoJSON(features);
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

describe('viewportFeatures collision', () => {
    let map, viz1, layer1, source1, setup;

    function setupMap (geojsonData, zoom = 0) {
        const VIEWPORT_SIZE = 500;

        setup = util.createMap('map', VIEWPORT_SIZE);
        map = setup.map;
        map.setZoom(zoom);

        source1 = new carto.source.GeoJSON(geojsonData);

        viz1 = new carto.Viz(`
              color: ramp($category, prism),
              strokeWidth: 0,
              @list: viewportFeatures($value ,$category, $cartodb_id);
            `);

        layer1 = new carto.Layer('layer1', source1, viz1);
        layer1.addTo(map);
    }

    describe('polygons', () => {
        beforeEach(() => {
            setupMap(generatePolygonsDataset());
        });

        it('should get correctly detected in the viewport', done => {
            layer1.on('loaded', () => {
                const expected = [
                    { cartodb_id: 1, value: 1, category: 'a' },
                    { cartodb_id: 2, value: 2, category: 'b' }
                ];

                checkFeatures(viz1.variables.list.eval(), expected);
                done();
            });
        });
    });

    describe('lines', () => {
        function generateLinesDataset () {
            const inner = {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [[0, 0], [0, 25]]
                },
                properties: {
                    cartodb_id: 1,
                    value: 1,
                    category: 'a'
                }
            };

            const oneVertexOutsideIntersecting = {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [[15, 0], [15, 60]]
                },
                properties: {
                    cartodb_id: 2,
                    value: 2,
                    category: 'b'
                }
            };

            const twoVerticesOutsideIntersecting = {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [[30, -60], [30, 60]]
                },
                properties: {
                    cartodb_id: 3,
                    value: 3,
                    category: 'c'
                }
            };

            const outside = {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [[70, -60], [70, 60]]
                },
                properties: {
                    cartodb_id: 4,
                    value: 4,
                    category: 'd'
                }
            };

            const features = [
                inner,
                oneVertexOutsideIntersecting,
                twoVerticesOutsideIntersecting,
                outside

            ];
            return { type: 'FeatureCollection', features };
        }

        beforeEach(() => {
            setupMap(generateLinesDataset(), 2);
        });

        it('should get correctly detected in the viewport', done => {
            layer1.on('loaded', () => {
                const expected = [
                    { cartodb_id: 1, value: 1, category: 'a' }, // completely inside
                    { cartodb_id: 2, value: 2, category: 'b' }, // one vertex outside
                    { cartodb_id: 3, value: 3, category: 'c' } // two vertices outside
                ];

                checkFeatures(viz1.variables.list.eval(), expected);
                done();
            });
        });
    });

    afterEach(() => {
        map.remove();
        document.body.removeChild(setup.div);
    });
});

describe('viewportFeatures using aggregation expressions', () => {
    describe('clusterCount', () => {
        let map, source, viz, layer, setup;

        beforeEach(() => {
            setup = util.createMap('map');
            map = setup.map;
            source = new carto.source.GeoJSON(aggregationFeatures);
        });

        it('should get the clusterCount of a feature', done => {
            viz = new carto.Viz(`
                @list: viewportFeatures(clusterCount())
            `);

            layer = new carto.Layer('layer', source, viz);
            layer.addTo(map);

            layer.on('updated', () => {
                const actual = Object.keys(viz.variables.list.value[0].properties);
                const expected = [CLUSTER_FEATURE_COUNT];
                expect(actual).toEqual(expected);
                done();
            });
        });

        it('should get the clusterCount of a feature when it is assigned to a variable', done => {
            const variableName = 'cc';

            viz = new carto.Viz(`
                @${variableName}: clusterCount()
                @list: viewportFeatures(@${variableName})
            `);

            layer = new carto.Layer('layer', source, viz);

            layer.addTo(map);

            layer.on('updated', () => {
                const actual = Object.keys(viz.variables.list.value[0].properties);
                const expected = [variableName];
                expect(actual).toEqual(expected);
                done();
            });
        });

        afterEach(() => {
            map.remove();
            document.body.removeChild(setup.div);
        });
    });
});

describe('regression in viewportFeatures', () => {
    let map, viz1, layer1, source1, setup;

    function setupMap (geojsonData, zoom = 0) {
        const VIEWPORT_SIZE = 500;

        setup = util.createMap('map', VIEWPORT_SIZE);
        map = setup.map;
        map.setZoom(zoom);

        source1 = new carto.source.GeoJSON(geojsonData);

        viz1 = new carto.Viz(`
              color: ramp($category, prism),
              @list: viewportFeatures($value, $category, $cartodb_id);
              filter: false
            `);

        layer1 = new carto.Layer('layer1', source1, viz1);
        layer1.addTo(map);
    }

    it('should not include hidden polygons', done => {
        setupMap(generatePolygonsDataset());
        layer1.on('loaded', () => {
            const numberOfFeatures = viz1.variables.list.value.length;
            expect(numberOfFeatures).toBe(0);
            done();
        });
    });

    afterEach(() => {
        map.remove();
        document.body.removeChild(setup.div);
    });
});
