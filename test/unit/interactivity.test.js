import { Interactivity, Viz, Layer, source } from '../../src/index';
import { CartoValidationTypes as cvt } from '../../src/errors/carto-validation-error';

const { Dataset } = source;

describe('api/interactivity', () => {
    describe('constructor', () => {
        let source, viz, layer, mockMap;

        beforeEach(() => {
            source = new Dataset('populated_places', {
                username: 'test',
                apiKey: '1234567890'
            });
            viz = new Viz();
            layer = new Layer('layer', source, viz);
            mockMap = { on: () => { } };
            layer.map = mockMap;
        });

        it('should build a new Interactivity object with (layer)', () => {
            const interactivity = new Interactivity(layer);

            expect(interactivity).toBeDefined();
            expect(interactivity._layerList).toEqual([layer]);
        });

        it('should build a new Interactivity object with ([layer])', () => {
            const interactivity = new Interactivity([layer]);

            expect(interactivity).toBeDefined();
            expect(interactivity._layerList).toEqual([layer]);
        });

        it('should build a new Interactivity object with two layers with the same map', () => {
            const layer2 = new Layer('layer2', source, new Viz());
            layer2.map = mockMap;
            const interactivity = new Interactivity([layer, layer2]);

            expect(interactivity).toBeDefined();
            expect(interactivity._layerList).toEqual([layer, layer2]);
        });

        it('should throw an error when the layer list is not an array', () => {
            expect(() => new Interactivity('wadus')).toThrowError(cvt.INCORRECT_TYPE + ' Invalid layer list, parameter must be an array of "carto.Layer" objects.');
        });

        it('should throw an error when the layer list is empty', () => {
            expect(() => new Interactivity([])).toThrowError(cvt.INCORRECT_VALUE + ' Invalid argument, layer list must not be empty.');
        });

        it('should throw an error when a layer is not a carto.Layer instance', () => {
            expect(() => new Interactivity(['wadus'])).toThrowError(cvt.INCORRECT_TYPE + ' Invalid layer, layer must be an instance of "carto.Layer".');
        });

        xit('should throw an error when the layers have different map', () => {
            const layer2 = new Layer('layer2', source, viz);
            const mockMap2 = { on: () => { } };
            layer2.map = mockMap2;

            expect(() => new Interactivity([layer, layer2])).toThrowError('Invalid argument, all layers must belong to the same map');
        });
    });
});
