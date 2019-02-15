import carto from '../../../../src';
import * as util from '../../util';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../../src/errors/carto-validation-error';

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
    properties: {}
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
    properties: {}
};

describe('Interactivity', () => {
    let div, map, source1, viz1, layer1, source2, viz2, layer2, interactivity;

    beforeEach(() => {
        const setup = util.createMap('map');
        div = setup.div;
        map = setup.map;

        source1 = new carto.source.GeoJSON(feature1);
        viz1 = new carto.Viz(`
            color: red
            @wadus: 123
        `);
        layer1 = new carto.Layer('layer1', source1, viz1);

        source2 = new carto.source.GeoJSON(feature2);
        viz2 = new carto.Viz(`
            color: opacity(green, 0.7)
        `);
        layer2 = new carto.Layer('layer2', source2, viz2);

        interactivity = new carto.Interactivity([layer1, layer2]);

        layer1.addTo(map);
        layer2.addTo(map);
    });

    describe('when the user clicks on the map', () => {
        describe('and the click is in a feature', () => {
            it('should fire a featureClick event with the feature 1 when it is clicked', done => {
                interactivity.on('featureClick', event => {
                    expect(event.features.length).toBe(1);
                    expect(event.features[0].id).toEqual(-0);
                    expect(event.features[0].layerId).toEqual('layer1');
                    done();
                });

                onLoaded(() => {
                    // Click on the feature 1
                    util.simulateClick({ lng: 5, lat: 5 });
                });
            });

            it('should fire a featureClick event with the feature 2 when it is clicked', done => {
                interactivity.on('featureClick', event => {
                    expect(event.features.length).toBe(1);
                    expect(event.features[0].id).toEqual(-0);
                    expect(event.features[0].layerId).toEqual('layer2');
                    done();
                });

                onLoaded(() => {
                    // Click on the feature 2
                    util.simulateClick({ lng: 50, lat: 50 });
                });
            });

            it('should fire a featureClick event with the feature 2 when it is clicked over a feature 1 hole', done => {
                interactivity.on('featureClick', event => {
                    expect(event.features.length).toBe(1);
                    expect(event.features[0].id).toEqual(-0);
                    expect(event.features[0].layerId).toEqual('layer2');
                    done();
                });

                onLoaded(() => {
                    // Click on the feature 2 (over a feature 1 hole)
                    util.simulateClick({ lng: 25, lat: 25 });
                });
            });

            it('should not fire a featureClickOut event when the same feature is clicked twice', done => {
                const featureClickOutSpy = jasmine.createSpy('featureClickOutSpy');
                interactivity.on('featureClick', () => {
                    expect(featureClickOutSpy).not.toHaveBeenCalled();
                    done();
                });
                interactivity.on('featureClickOut', featureClickOutSpy);
                onLoaded(() => {
                    // Click on the feature 1
                    util.simulateClick({ lng: 5, lat: 5 });
                    // Move the mouse
                    util.simulateMove({ lng: 5, lat: 10 });
                    // Click on the same feature 1
                    util.simulateClick({ lng: 5, lat: 15 });
                });
            });

            it('should fire a featureClick event with the proper feature attributes', done => {
                interactivity.on('featureClick', event => {
                    const feature = event.features[0];
                    expect(feature.reset).toBeDefined();
                    expect(feature.blendTo).toBeDefined();
                    expect(feature.getRenderedCentroid).toBeDefined();
                    expect(feature.color.blendTo).toBeDefined();
                    expect(feature.color.reset).toBeDefined();
                    expect(feature.variables.wadus.value).toEqual(123);
                    expect();
                    done();
                });

                onLoaded(() => {
                    // Click on the feature 1
                    util.simulateClick({ lng: 5, lat: 5 });
                });
            });

            describe('and multiple features are clicked', () => {
                it('should return the right features id and layerId', done => {
                    interactivity.on('featureClick', event => {
                        expect(event.features.length).toBe(2);
                        expect(event.features[0].id).toEqual(-0);
                        expect(event.features[0].layerId).toEqual('layer1');
                        expect(event.features[1].id).toEqual(-0);
                        expect(event.features[1].layerId).toEqual('layer2');
                        done();
                    });
                    onLoaded(() => {
                        // Click on the features 1 and 2
                        util.simulateClick({ lng: 35, lat: 35 });
                    });
                });
            });

            describe('and the click is not in a feature', () => {
                it('should fire a featureClick event with an empty features list', done => {
                    interactivity.on('featureClick', event => {
                        expect(event.features.length).toEqual(0);
                        done();
                    });
                    onLoaded(() => {
                        // Click on the features
                        util.simulateClick({ lng: -5, lat: -5 });
                        // (over a feature 1 hole)
                        util.simulateClick({ lng: 15, lat: 15 });
                    });
                });

                describe('and a feature was previously clicked', () => {
                    it('should fire a featureClickOut event with a features list containing the previously clicked feature', done => {
                        interactivity.on('featureClickOut', event => {
                            expect(event.features[0].id).toEqual(-0);
                            expect(event.features[0].layerId).toEqual('layer1');
                            done();
                        });
                        onLoaded(() => {
                            // Click on the feature 1
                            util.simulateClick({ lng: 5, lat: 5 });
                            // Move the mouse
                            const moveMouse = debounce(() => {
                                util.simulateMove({ lng: 0, lat: 0 });
                            }, 500);

                            moveMouse();

                            // Click on the feature 1
                            util.simulateClick({ lng: -5, lat: -5 });
                        });
                    });
                });
            });

            it('should not fire a click-derived event if it is disabled', done => {
                interactivity.disable();

                const onClickSpy = spyOn(interactivity, '_onClick');
                const createFeatureEventSpy = spyOn(interactivity, '_createFeatureEvent');

                onLoaded(() => {
                    // Click on the feature 1
                    util.simulateClick({ lng: 5, lat: 5 });

                    setTimeout(() => {
                        expect(onClickSpy).toHaveBeenCalled();
                        expect(createFeatureEventSpy).not.toHaveBeenCalled();
                        done();
                    }, 0);
                });
            });
        });
    });

    describe('when the user moves the mouse on the map', () => {
        describe('and the mouse enters in a feature', () => {
            it('should fire a featureHover event with a features list containing the entered feature', done => {
                interactivity.on('featureHover', event => {
                    expect(event.features.length).toBe(1);
                    expect(event.features[0].id).toEqual(-0);
                    expect(event.features[0].layerId).toEqual('layer1');
                    done();
                });
                onLoaded(() => {
                    // Move mouse inside a feature 1
                    util.simulateMove({ lng: 5, lat: 5 });
                });
            });

            it('should fire a featureEnter event with a features list containing the entered feature', done => {
                interactivity.on('featureEnter', event => {
                    expect(event.features.length).toBe(1);
                    expect(event.features[0].id).toEqual(-0);
                    expect(event.features[0].layerId).toEqual('layer1');
                    done();
                });
                onLoaded(() => {
                    // Move mouse inside a feature 1
                    util.simulateMove({ lng: 5, lat: 5 });
                });
            });

            it('should not fire a featureEnter event when the mouse is moved inside the same feature', done => {
                const featureEnterSpy = jasmine.createSpy('featureEnterSpy');
                onLoaded(() => {
                    interactivity.on('featureEnter', featureEnterSpy);
                    // Move mouse inside a feature 1
                    util.simulateMove({ lng: 5, lat: 5 });
                    // Move mouse inside the same feature 1
                    util.simulateMove({ lng: 5, lat: 15 });
                    setTimeout(() => {
                        expect(featureEnterSpy).toHaveBeenCalledTimes(1);
                        done();
                    }, 0);
                });
            });
        });

        describe('and the mouse leaves a feature', () => {
            it('should fire a featureLeave event with a features list containing the previously entered feature', done => {
                onLoaded(() => {
                    // Move mouse inside a feature 1
                    util.simulateMove({ lng: 5, lat: 5 });
                    interactivity.on('featureLeave', event => {
                        expect(event.features.length).toBe(1);
                        expect(event.features[0].id).toEqual(-0);
                        expect(event.features[0].layerId).toEqual('layer1');
                        done();
                    });
                    // Move mouse outside any feature
                    util.simulateMove({ lng: -5, lat: -5 });
                });
            });

            it('should not fire a featureLeave event when the mouse is moved outside any feature', done => {
                layer2.on('loaded', () => {
                    const featureLeaveSpy = jasmine.createSpy('featureLeaveSpy');
                    // Move mouse outside any feature
                    util.simulateMove({ lng: -5, lat: -5 });
                    interactivity.on('featureLeave', featureLeaveSpy);
                    interactivity.on('featureHover', () => {
                        expect(featureLeaveSpy).not.toHaveBeenCalled();
                        done();
                    });
                    // Move mouse outside any feature (over a feature 1 hole)
                    util.simulateMove({ lng: 15, lat: 15 });
                });
            });
        });

        it('should not fire a featureHover / featureEnter or featureLeave event if it is disabled', done => {
            interactivity.disable();

            const onMouseMoveSpy = spyOn(interactivity, '_onMouseMove');
            const createFeatureEventSpy = spyOn(interactivity, '_createFeatureEvent');

            onLoaded(() => {
                // Move mouse inside a feature 1
                util.simulateMove({ lng: 5, lat: 5 });
                // Move mouse outside any feature
                util.simulateMove({ lng: -5, lat: -5 });

                setTimeout(() => {
                    expect(onMouseMoveSpy).toHaveBeenCalled();
                    expect(createFeatureEventSpy).not.toHaveBeenCalled();
                    done();
                }, 0);
            });
        });
    });

    describe('while the map is being moved (eg. dragPan)', () => {
        it('should be automatically tracked (to later on control enabled / disabled state)', done => {
            const setMapStateSpy = spyOn(interactivity, '_setMapState');

            onLoaded(() => {
                // Emulate a dragPan on the map (over features)
                const a = {
                    lng: 31.20,
                    lat: 35.81
                };
                const b = {
                    lng: 30.00,
                    lat: 35.81
                };
                const c = {
                    lng: 31.20,
                    lat: 33.84
                };

                map.on('moveend', () => {
                    setTimeout(() => {
                        expect(setMapStateSpy).toHaveBeenCalledTimes(2);
                        expect(setMapStateSpy).toHaveBeenCalledWith('moving');
                        expect(setMapStateSpy).toHaveBeenCalledWith('idle');
                        done();
                    }, 0);
                });

                util.simulateDrag([a, b, c]);
            });
        });
    });

    describe('when the layer changes', () => {
        describe('and appears a feature below the mouse', () => {
            it('should fire a featureHover event with the feature 1', done => {
                onLoaded(() => {
                    // Hide feature
                    viz1.filter = 0;
                    // Setup initial mouse position
                    util.simulateMove({ lng: 5, lat: 5 });

                    // Register event after move to be called by layer `updated`
                    interactivity.on('featureHover', event => {
                        expect(event.features.length).toBe(1);
                        expect(event.features[0].id).toEqual(-0);
                        expect(event.features[0].layerId).toEqual('layer1');
                        done();
                    });

                    // Show feature
                    viz1.filter = 1;
                });
            });
        });
    });

    describe('.on', () => {
        it('should throw an error when subscribing to an invalid event', () => {
            expect(() => { interactivity.on('invalidEventName'); }).toThrowError(/Unrecognized event/);
        });
    });

    describe('.off', () => {
        it('should throw an error when unsubscribing to an invalid event', () => {
            expect(() => { interactivity.off('invalidEventName'); }).toThrowError(/Unrecognized event/);
        });
    });

    describe('.enable / .disable', () => {
        it('should allow turn on & off the whole interactivity', () => {
            expect(interactivity.isEnabled).toBeTruthy(); // enabled by default
            interactivity.disable();
            expect(interactivity.isEnabled).toBeFalsy();
            interactivity.enable();
            expect(interactivity.isEnabled).toBeTruthy();
        });

        it('should be disabled while map is moving', () => {
            expect(interactivity.isEnabled).toBeTruthy(); // enabled by default
            interactivity._mapState = 'moving';
            expect(interactivity.isEnabled).toBeFalsy();
            interactivity._mapState = 'idle';
            expect(interactivity.isEnabled).toBeTruthy();
        });
    });

    xdescribe('when the user creates a new Interactivity object', () => {
        it('should throw an error when layers belong to different maps', done => {
            const setupA = util.createMap('mapA');
            const setupB = util.createMap('mapB');
            const layerA = new carto.Layer('layerA', new carto.source.GeoJSON({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [0, 0]
                },
                properties: {}
            }), new carto.Viz());
            const layerB = new carto.Layer('layerA', new carto.source.GeoJSON({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [0, 0]
                },
                properties: {}
            }), new carto.Viz());

            const int = new carto.Interactivity([layerA, layerB]);
            int._init([layerA, layerB]).catch((err) => {
                expect(err).toEqual(new CartoValidationError(`${cvt.INCORRECT_VALUE} Invalid argument, all layers must belong to the same map.`));
                document.body.removeChild(setupA.div);
                document.body.removeChild(setupB.div);
                done();
            });

            layerA.addTo(setupA.map);
            layerB.addTo(setupB.map);
        });
    });

    function onLoaded (callback) {
        carto.on('loaded', [layer1, layer2], callback);
    }

    afterEach(() => {
        map.remove();
        document.body.removeChild(div);
    });
});

describe('Cursor', () => {
    let map, source1, viz1, layer1, setup;

    beforeEach(() => {
        setup = util.createMap('map');
        map = setup.map;

        source1 = new carto.source.GeoJSON(feature1);
        viz1 = new carto.Viz(`
            color: red
            @wadus: 123
        `);
        layer1 = new carto.Layer('layer1', source1, viz1);

        layer1.addTo(map);
    });

    describe('when the interactivity is instantiated by default', () => {
        it('should set the cursor to be pointer when user is over a feature', done => {
            new carto.Interactivity(layer1);
            expect(map.getCanvas().style.cursor).toEqual('');

            layer1.on('loaded', () => {
                // Move mouse inside a feature 1
                util.simulateMove({ lng: 5, lat: 5 });
                setTimeout(() => {
                    expect(map.getCanvas().style.cursor).toEqual('pointer');
                    done();
                }, 0);
            });
        });

        it('should set the cursor to be empty when user is over a feature', done => {
            new carto.Interactivity(layer1, { autoChangePointer: false });
            expect(map.getCanvas().style.cursor).toEqual('');
            layer1.on('loaded', () => {
                // Move mouse inside a feature 1
                util.simulateMove({ lng: 5, lat: 5 });
                setTimeout(() => {
                    expect(map.getCanvas().style.cursor).toEqual('');
                    done();
                }, 0);
            });
        });
    });

    describe('when layer visibility changes to hidden', () => {
        it('should not fire any event', done => {
            new carto.Interactivity(layer1);

            expect(map.getCanvas().style.cursor).toEqual('');

            layer1.on('loaded', () => {
                layer1.hide();
                // Move mouse inside a feature 1
                util.simulateMove({ lng: 5, lat: 5 });

                setTimeout(() => {
                    expect(map.getCanvas().style.cursor).toEqual('');
                    done();
                }, 0);
            });
        });
    });

    describe('when layer visibility changes to visible', () => {
        it('should fire any event', done => {
            new carto.Interactivity(layer1);

            expect(map.getCanvas().style.cursor).toEqual('');

            layer1.on('loaded', () => {
                layer1.hide();
                layer1.show();
                // Move mouse inside a feature 1
                util.simulateMove({ lng: 5, lat: 5 });

                setTimeout(() => {
                    expect(map.getCanvas().style.cursor).toEqual('pointer');
                    done();
                }, 0);
            });
        });
    });

    afterEach(() => {
        map.remove();
        document.body.removeChild(setup.div);
    });
});

describe('regression with a category filter', () => {
    let map, setup, source1, viz1, layer1, interactivity;
    beforeEach(() => {
        setup = util.createMap('map');
        map = setup.map;

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
                cat: 'asdf'
            }
        };

        source1 = new carto.source.GeoJSON(feature1);
        viz1 = new carto.Viz(`
            color: red
            @wadus: 123
            filter: $cat == 'asdf'
        `);
        layer1 = new carto.Layer('layer1', source1, viz1);
        interactivity = new carto.Interactivity([layer1]);
        layer1.addTo(map);
    });

    it('should fire a featureClick event with the feature 1 when it is clicked', done => {
        interactivity.on('featureClick', event => {
            expect(event.features.length).toBe(1);
            expect(event.features[0].id).toEqual(-0);
            expect(event.features[0].layerId).toEqual('layer1');
            done();
        });

        layer1.on('loaded', () => {
            // Click on the feature 1
            util.simulateClick({ lng: 5, lat: 5 });
        });
    });

    afterEach(() => {
        map.remove();
        document.body.removeChild(setup.div);
    });
});

describe('regression with blendTo', () => {
    let div, map, source, viz, layer, interactivity;

    beforeEach(() => {
        const setup = util.createMap('map');
        div = setup.div;
        map = setup.map;

        source = new carto.source.GeoJSON(feature1);
        viz = new carto.Viz(`
            color: red
            @wadus: 123
        `);
        layer = new carto.Layer('layer1', source, viz);
        interactivity = new carto.Interactivity(layer);
        layer.addTo(map);
    });

    it('should ignore rejected updates when coming from `reset`', done => {
        let error = null;
        // chrome-only event
        window.addEventListener('unhandledrejection', function (promiseRejectionEvent) {
            error = promiseRejectionEvent;
        });

        const moveAway = debounce(() => {
            util.simulateMove({ lng: -5, lat: -5 });
        });

        interactivity.on('featureEnter', async event => {
            layer.on('updated', moveAway);

            const feature = event.features[0];
            await feature.color.blendTo('green', 50);
            await feature.strokeWidth.blendTo(40, 50);
        });

        const resetEnd = debounce(() => {
            const thereWasAnUpdateError = error && error.reason.message.startsWith('Another `viz change` finished before this one');
            expect(thereWasAnUpdateError).toBeFalsy();
            done();
        }, 500);

        interactivity.on('featureLeave', async event => {
            layer.off('updated', moveAway);

            const feature = event.features[0];
            await feature.color.reset();
            await feature.strokeWidth.reset();

            layer.on('updated', resetEnd);
        });

        onLoaded(() => {
            // Hover on the feature 1
            util.simulateMove({ lng: 5, lat: 5 });
        });
    });

    function onLoaded (callback) {
        layer.on('loaded', callback);
    }

    afterEach(() => {
        map.remove();
        document.body.removeChild(div);
    });
});

const debounce = (func, delay = 250) => {
    let timeoutId;
    return function () {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(func, delay);
    };
};
