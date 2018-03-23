import Interactivity from '../../../src/api/interactivity';

describe('api/interactivity', () => {
    describe('constructor', () => {
        it('should throw an error when the layer list is not an array', () => {
            expect(() => new Interactivity('wadus')).toThrowError(/.*carto.Layer.*/);
        });
        it('should throw an error when a layer is not a carto.Layer instance', () => {
            expect(() => new Interactivity(['wadus'])).toThrowError(/.*carto.Layer.*/);
        });
        it('should throw an error when the layer list is empty', () => {
            expect(() => new Interactivity([])).toThrowError(/.*empty*/);
        });
    });
});
