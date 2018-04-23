import * as carto from '../../../../src/';
import mapboxgl from '../../../../vendor/mapbox-gl-dev';

describe('Interactivity', () => {
    let div, source, viz, layer, map;

    beforeEach(() => {
        const setup = _setup('map');
        div = setup.div;
        map = setup.map;

        source = new carto.source.GeoJSON(featureJson);
        viz = new carto.Viz(`
            color: rgb(255, 0, 0)
            @wadus: 123`
        );
        layer = new carto.Layer('layer', source, viz);
        layer.addTo(map);
    });

    describe('When the user creates a new Interactivity object', () => {
        xit('should throw an error when layers belong to different maps', done => {
            let loadedLayers = 0;
            const setup = _setup('map1');
            const div2 = setup.div;
            const map2 = setup.map;
            const source2 = new carto.source.GeoJSON(featureJson);
            const viz2 = new carto.Viz('color: rgb(255, 0, 0)');
            const layer2 = new carto.Layer('layer2', source2, viz2);

            layer.on('loaded', _testHelper);
            layer2.on('loaded', _testHelper);

            layer.addTo(map);
            layer2.addTo(map2);

            // Create the interactivity object when both layers were added to a map.
            // this only happens when loadedLayers equals to 2.
            function _testHelper() {
                loadedLayers++;
                if (loadedLayers === 2) {
                    expect(() => new carto.Interactivity([layer, layer2])).toThrowError(/all layers must belong to the same map/);
                    document.body.removeChild(div2);
                    done();
                }
            }
        });
    });

    describe('.on', () => {
        let interactivity;
        it('should throw an error when subscribing to an invalid event', () => {
            interactivity = new carto.Interactivity(layer);
            expect(() => { interactivity.on('invalidEventName'); }).toThrowError(/Unrecognized event/);
        });
    });

    describe('.off', () => {
        let interactivity;
        it('should throw an error when unsubscribing to an invalid event', () => {
            interactivity = new carto.Interactivity(layer);
            expect(() => { interactivity.off('invalidEventName'); }).toThrowError(/Unrecognized event/);
        });
    });

    fdescribe('when the user clicks on the map', () => {
        let interactivity;

        describe('and the click is in a feature', () => {
            it('should fire a featureClick event with a features list containing the clicked feature', done => {
                interactivity = new carto.Interactivity(layer);
                interactivity.on('featureClick', event => {
                    expect(event.features[0].color.blendTo).toBeDefined();
                    expect(event.features[0].color.reset).toBeDefined();
                    expect(event.features[0].reset).toBeDefined();
                    expect(event.features[0].variables.wadus.value).toEqual(123);
                    expect(event.features[0].id).toEqual(0);
                    expect(event.features[0].layerId).toEqual('layer');
                    done();
                });
                layer.on('loaded', click);
            });

            it('should not fire a featureClickOut event when the same feature is clicked twice', done => {
                interactivity = new carto.Interactivity(layer);
                const featureClickOutSpy = jasmine.createSpy('featureClickOutSpy');
                const featureClickSpy = jasmine.createSpy('featureClickSpy');
                interactivity.on('featureClick', featureClickSpy);
                interactivity.on('featureClickOut', featureClickOutSpy);
                layer.on('loaded', () => {
                    // Click inside the feature
                    click();
                    click();
                    expect(featureClickOutSpy).not.toHaveBeenCalled();
                    expect(featureClickSpy).toHaveBeenCalled();
                    done();
                });
            });

            describe('and multiple features are clicked', () => {
                it('should return the right feature.id', done => {
                    const layer2 = new carto.Layer('layer2', new carto.source.GeoJSON(featureJson), new carto.Viz());
                    layer2.addTo(map);
                    interactivity = new carto.Interactivity([layer, layer2]);
                    interactivity.on('featureClick', event => {
                        expect(event.features[0].id).toEqual(0);
                        expect(event.features[0].layerId).toEqual('layer');
                        expect(event.features[1].id).toEqual(0);
                        expect(event.features[1].layerId).toEqual('layer2');
                        done();
                    });
                    layer2.on('loaded', click);
                });
            });
        });

        describe('when the user move the mouse on the map', () => {
            let interactivity;

            describe('and the mouse enters in a feature', () => {
                it('should fire a featureHover event with a features list containing the entered feature', done => {
                    interactivity = new carto.Interactivity(layer);
                    interactivity.on('featureHover', event => {
                        expect(event.features[0].id).toEqual(0);
                        expect(event.features[0].layerId).toEqual('layer');
                        done();
                    });
                    layer.on('loaded', () => {
                        // Move mouse inside a feature
                        map.fire('click', { lngLat: { lng: -10, lat: -10 } });
                        map.fire('mousemove', { lngLat: { lng: 10, lat: 10 } });
                    });
                });

                it('should fire a featureEnter event with a features list containing the entered feature', done => {
                    interactivity = new carto.Interactivity(layer);
                    interactivity.on('featureEnter', event => {
                        expect(event.features[0].id).toEqual(0);
                        expect(event.features[0].layerId).toEqual('layer');
                        done();
                    });
                    layer.on('loaded', () => {
                        // Move mouse inside a feature
                        map.fire('mousemove', { lngLat: { lng: 10, lat: 10 } });
                    });
                });

                it('should not fire a featureEnter event when the mouse is moved inside the same feature', done => {
                    interactivity = new carto.Interactivity(layer);
                    const featureClickOutSpy = jasmine.createSpy('featureClickOutSpy');
                    layer.on('loaded', () => {
                        // Move mouse inside a feature
                        map.fire('mousemove', { lngLat: { lng: 10, lat: 10 } });
                        interactivity.on('featureEnter', featureClickOutSpy);
                        interactivity.on('featureHover', () => {
                            expect(featureClickOutSpy).not.toHaveBeenCalled();
                            done();
                        });
                        // Move mouse inside the same feature
                        map.fire('mousemove', { lngLat: { lng: 20, lat: 20 } });
                    });
                });
            });

            describe('and the mouse leaves a feature', () => {
                it('should fire a featureHover event with an empty features list', done => {
                    interactivity = new carto.Interactivity(layer);
                    layer.on('loaded', () => {
                        // Move mouse inside a feature
                        map.fire('mousemove', { lngLat: { lng: 10, lat: 10 } });
                        interactivity.on('featureHover', event => {
                            expect(event.features.length).toEqual(0);
                            done();
                        });
                        // Move mouse outside any feature
                        map.fire('mousemove', { lngLat: { lng: -10, lat: -10 } });
                    });
                });

                it('should fire a featureLeave event with a features list containing the previously entered feature', done => {
                    interactivity = new carto.Interactivity(layer);
                    layer.on('loaded', () => {
                        // Move mouse inside a feature
                        map.fire('mousemove', { lngLat: { lng: 10, lat: 10 } });
                        interactivity.on('featureLeave', event => {
                            expect(event.features[0].id).toEqual(0);
                            expect(event.features[0].layerId).toEqual('layer');
                            done();
                        });
                        // Move mouse outside the feature
                        map.fire('mousemove', { lngLat: { lng: -10, lat: -10 } });
                    });
                });

                it('should not fire a featureLeave event when the mouse is moved outside any feature', done => {
                    interactivity = new carto.Interactivity(layer);
                    layer.on('loaded', () => {
                        const featureLeaveSpy = jasmine.createSpy('featureLeaveSpy');
                        // Move mouse outside any feature
                        map.fire('mousemove', { lngLat: { lng: -10, lat: -10 } });
                        interactivity.on('featureLeave', featureLeaveSpy);
                        interactivity.on('featureHover', () => {
                            expect(featureLeaveSpy).not.toHaveBeenCalled();
                            done();
                        });
                        // Move mouse outside any feature
                        map.fire('mousemove', { lngLat: { lng: -20, lat: -20 } });
                    });
                });
            });
        });

        afterEach(() => {
            document.body.removeChild(div);
        });
    });

    function _setup(name) {
        const div = document.createElement('div');
        div.id = name;
        div.style.width = '1000px';
        div.style.height = '1000px';
        document.body.appendChild(div);

        const map = new mapboxgl.Map({
            container: name,
            style: { version: 8, sources: {}, layers: [] },
            center: [30, 30],
            zoom: 12
        });

        return { div, map };
    }

    function click() {
        const mglInteractivity = document.querySelector('.mapboxgl-interactive');
        const ev = new MouseEvent('click', {});
        mglInteractivity.dispatchEvent(ev);
    }

    const featureJson = {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                [
                    [0, 0],
                    [50, 0],
                    [50, 50],
                    [0, 50],
                    [0, 0]
                ]
            ]
        },
        properties: {}
    };

    const featureCollectionJson = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [0, 0],
                            [50, 0],
                            [50, 50],
                            [0, 50],
                            [0, 0]
                        ]
                    ]
                },
                properties: {}
            },
            {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [0, 0],
                            [55, 0],
                            [55, 55],
                            [0, 55],
                            [0, 0]
                        ]
                    ]
                },
                properties: {}
            }
        ]
    };
});
