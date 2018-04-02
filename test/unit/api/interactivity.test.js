import Dataset from '../../../src/api/source/dataset';
import Style from '../../../src/api/style';
import Layer from '../../../src/api/layer';
import Interactivity from '../../../src/api/interactivity';

describe('api/interactivity', () => {
    describe('constructor', () => {
        it('should build a new Interactivity object with (layer)', () => {
            const source = new Dataset('ne_10m_populated_places_simple', {
                user: 'test',
                apiKey: '1234567890'
            });
            const style = new Style();
            const layer = new Layer('layer', source, style);
            const mockIntegrator = { on: () => {} };
            layer.getIntegrator = () => mockIntegrator;

            const interactivity = new Interactivity(layer);
            expect(interactivity).toBeDefined();
            expect(interactivity._layerList).toEqual([layer]);
        });

        it('should build a new Interactivity object with ([layer])', () => {
            const source = new Dataset('ne_10m_populated_places_simple', {
                user: 'test',
                apiKey: '1234567890'
            });
            const style = new Style();
            const layer = new Layer('layer', source, style);
            const mockIntegrator = { on: () => {} };
            layer.getIntegrator = () => mockIntegrator;

            const interactivity = new Interactivity([layer]);
            expect(interactivity).toBeDefined();
            expect(interactivity._layerList).toEqual([layer]);
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
    });
});
