
import CartoValidationError from '../../../src/errors/carto-validation-error';
import * as ERROR_LIST from '../../../src/errors/error-list';

describe('errors/CartoValidationError', () => {
    it('should allow a generic error', () => {
        const error = new CartoValidationError();
        expect(error.name).toBe('CartoError');
        expect(error.origin).toBe('validation');
        expect(error.type).toBe('');
        expect(error.message).toBe('unexpected error');
    });

    it('should work with no params in message', () => {
        const error = new CartoValidationError('layer', 'idRequired');
        expect(error.origin).toBe('validation');
        expect(error.type).toBe('layer');
        expect(error.message).toBe(ERROR_LIST.validation.layer['id-required'].friendlyMessage);
    });

    it('should work with 1 template param in message', () => {
        const error = new CartoValidationError('viz', 'nonValidExpression[color]');
        expect(error.origin).toBe('validation');
        expect(error.type).toBe('viz');
        const expected = ERROR_LIST.validation.viz['non-valid-expression']
            .friendlyMessage.replace('$0', 'color');
        expect(error.message).toBe(expected);
    });

    it('should work with >1 template params in message', () => {
        const error = new CartoValidationError('source', 'windshaftIncompatibleClusterAggr[{whatever}, propertyName]');
        expect(error.origin).toBe('validation');
        expect(error.type).toBe('source');
        const expected = ERROR_LIST.validation.source['windshaft-incompatible-cluster-aggr'].friendlyMessage
            .replace('$0', '{whatever}')
            .replace('$1', 'propertyName');
        expect(error.message).toBe(expected);
    });
});
