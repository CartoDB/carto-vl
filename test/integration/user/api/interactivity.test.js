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

                layer2.on('loaded', () => {
                    // Click inside the feature 1
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

                layer2.on('loaded', () => {
                    // Click inside the feature 2 (over a feature 1 hole)
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
                layer2.on('loaded', () => {
                    // Click inside the feature 1
                    util.simulateClick({ lng: 5, lat: 5 });
                    // Move the mouse
                    util.simulateMove({ lng: 5, lat: 10 });
                    // Click inside the same feature 1
                    util.simulateClick({ lng: 5, lat: 15 });
                });
            });

            it('should fire a featureClick event with the proper feature attributes', done => {
                interactivity.on('featureClick', event => {
                    expect(event.features[0].reset).toBeDefined();
                    expect(event.features[0].color.blendTo).toBeDefined();
                    expect(event.features[0].color.reset).toBeDefined();
                    expect(event.features[0].variables.wadus.value).toEqual(123);
                    done();
                });

                layer2.on('loaded', () => {
                    // Click inside the feature 1
                    util.simulateClick({ lng: 5, lat: 5 });
                });
            });

            describe('and multiple features are clicked', () => {
                it('should return the right features id and layerId', done => {
                    interactivity.on('featureClick', event => {
                        expect(event.features[0].id).toEqual(-0);
                        expect(event.features[0].layerId).toEqual('layer1');
                        expect(event.features[1].id).toEqual(-0);
                        expect(event.features[1].layerId).toEqual('layer2');
                        done();
                    });
                    layer2.on('loaded', () => {
                        // Click inside the features 1 and 2
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
                    layer2.on('loaded', () => {
                        // Click outside the features
                        util.simulateClick({ lng: -5, lat: -5 });
                        // (in a feature 1 hole)
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
                        layer2.on('loaded', () => {
                            // Click inside the feature 1
                            util.simulateClick({ lng: 5, lat: 5 });
                            // Move the mouse
                            util.simulateMove({ lng: 0, lat: 0 });
                            // Click outside the feature 1
                            util.simulateClick({ lng: -5, lat: -5 });
                        });
                    });
                });
            });
        });

        describe('when the user move the mouse on the map', () => {
            describe('and the mouse enters in a feature', () => {
                it('should fire a featureHover event with a features list containing the entered feature', done => {
                    interactivity.on('featureHover', event => {
                        expect(event.features[0].id).toEqual(-0);
                        expect(event.features[0].layerId).toEqual('layer1');
                        done();
                    });
                    layer2.on('loaded', () => {
                        // Move mouse inside a feature 1
                        util.simulateMove({ lng: 5, lat: 5 });
                    });
                });

                it('should fire a featureEnter event with a features list containing the entered feature', done => {
                    interactivity.on('featureEnter', event => {
                        expect(event.features[0].id).toEqual(-0);
                        expect(event.features[0].layerId).toEqual('layer1');
                        done();
                    });
                    layer2.on('loaded', () => {
                        // Move mouse inside a feature 1
                        util.simulateMove({ lng: 5, lat: 5 });
                    });
                });

                it('should not fire a featureEnter event when the mouse is moved inside the same feature', done => {
                    const featureClickOutSpy = jasmine.createSpy('featureClickOutSpy');
                    layer2.on('loaded', () => {
                        // Move mouse inside a feature 1
                        util.simulateMove({ lng: 5, lat: 5 });
                        interactivity.on('featureEnter', featureClickOutSpy);
                        interactivity.on('featureHover', () => {
                            expect(featureClickOutSpy).not.toHaveBeenCalled();
                            done();
                        });
                        // Move mouse inside the same feature 1
                        util.simulateMove({ lng: 5, lat: 15 });
                    });
                });
            });

            describe('and the mouse leaves a feature', () => {
                it('should fire a featureHover event with an empty features list', done => {
                    layer2.on('loaded', () => {
                        // Move mouse inside a feature 1
                        util.simulateMove({ lng: 5, lat: 5 });
                        interactivity.on('featureHover', event => {
                            expect(event.features.length).toEqual(0);
                            done();
                        });
                        // Move mouse outside any feature (in a feature 1 hole)
                        util.simulateMove({ lng: 15, lat: 15 });
                    });
                });

                it('should fire a featureLeave event with a features list containing the previously entered feature', done => {
                    layer2.on('loaded', () => {
                        // Move mouse inside a feature 1
                        util.simulateMove({ lng: 5, lat: 5 });
                        interactivity.on('featureLeave', event => {
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
                        // Move mouse outside any feature
                        util.simulateMove({ lng: -10, lat: -10 });
                    });
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
                expect(err).toEqual(new Error('Invalid argument, all layers must belong to the same map'));
                document.body.removeChild(setupA.div);
                document.body.removeChild(setupB.div);
                done();
            });

            layerA.addTo(setupA.map);
            layerB.addTo(setupB.map);
        });
    });

    afterEach(() => {
        document.body.removeChild(div);
    });
});
