import Dataset from '../../../src/api/source/dataset';
import Style from '../../../src/api/style';
import Layer from '../../../src/api/layer';
import Interactivity from '../../../src/api/interactivity';

describe('api/interactivity', () => {
    describe('constructor', () => {
        let source, style, layer, mockIntegrator;

        beforeEach(() => {
            source = new Dataset('ne_10m_populated_places_simple', {
                user: 'test',
                apiKey: '1234567890'
            });
            style = new Style();
            layer = new Layer('layer', source, style);
            mockIntegrator = { on: () => {} };
            layer.getIntegrator = () => mockIntegrator;
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

        it('should build a new Interactivity object with two layers with the same integrator', () => {
            const layer2 = new Layer('layer2', source, new Style());
            layer2.getIntegrator = () => mockIntegrator;
            const interactivity = new Interactivity([layer, layer2]);

            expect(interactivity).toBeDefined();
            expect(interactivity._layerList).toEqual([layer, layer2]);
        });

        it('should throw an error when the layer list is not an array', () => {
            expect(() => new Interactivity('wadus')).toThrowError('Invalid layer list, parameter must be an array of carto.Layer objects');
        });

        it('should throw an error when the layer list is empty', () => {
            expect(() => new Interactivity([])).toThrowError('Invalid argument, layer list must not be empty');
        });

        it('should throw an error when a layer is not a carto.Layer instance', () => {
            expect(() => new Interactivity(['wadus'])).toThrowError('Invalid layer, layer must be an instance of carto.Layer');
        });

        xit('should throw an error when the layers have different integrator', () => {
            const layer2 = new Layer('layer2', source, style);
            const mockIntegrator2 = { on: () => {} };
            layer2.getIntegrator = () => mockIntegrator2;

            expect(() => new Interactivity([layer, layer2])).toThrowError('Invalid argument, all layers must belong to the same map');
        });
    });
});
