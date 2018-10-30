import carto from '../../../../src';
import * as util from '../../util';

const featureData = {
    'type': 'FeatureCollection',
    'features': [
        {
            'type': 'Feature',
            'properties': {
                num: 1,
                cat: 'A'
            },
            geometry: {
                type: 'Point',
                coordinates: [0, 0]
            }
        },
        {
            'type': 'Feature',
            'properties': {
                num: 2,
                cat: null
            },
            geometry: {
                type: 'Point',
                coordinates: [10, 0]
            }
        },
        {
            'type': 'Feature',
            'properties': {
                num: null,
                cat: 'C'
            },
            geometry: {
                type: 'Point',
                coordinates: [20, 0]
            }
        }
    ]
};

describe('Null values', () => {
    let div, map, source, viz, layer;

    beforeEach(() => {
        const setup = util.createMap('map');
        map = setup.map;
        div = setup.div;

        source = new carto.source.GeoJSON(featureData);
    });

    describe('on numeric properties', () => {
        it('should filter null values with isNull()', (done) => {
            viz = new carto.Viz(`
                filter: not(isNull($num))
                @features: viewportFeatures($num)
            `);
            layer = new carto.Layer('layer', source, viz);
            layer.addTo(map);

            layer.on('loaded', () => {
                expect(viz.variables.features.value.map(f => f.properties.num)).toEqual([1, 2]);
                done();
            });
        });
        describe('on categorical properties', () => {
            it('should filter null values with isNull()', done => {
                viz = new carto.Viz(`
                    filter: not(isNull($cat))
                    @features: viewportFeatures($cat)
                `);
                layer = new carto.Layer('layer', source, viz);
                layer.addTo(map);

                layer.on('loaded', () => {
                    expect(viz.variables.features.value.map(f => f.properties.cat)).toEqual(['A', 'C']);
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
