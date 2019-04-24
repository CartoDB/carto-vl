import CartoError from '../../../src/errors/carto-error';
import CartoValidationError, { CartoValidationTypes } from '../../../src/errors/carto-validation-error';

describe('errors/CartoValidationError', () => {
    it('should allow a simple error', () => {
        const error = new CartoValidationError('my error');

        expect(error instanceof CartoError);
        expect(error instanceof CartoValidationError);
        expect(error.name).toBe('CartoValidationError');
        expect(error.message).toBe('[Error] my error');
    });

    it('shouldn\'t allow an error without a message', () => {
        expect(() => new CartoValidationError()).toThrow();
    });

    it('should allow an error message using several predefined categories', () => {
        const errors = [];
        errors.push(new CartoValidationError('\'id\'', CartoValidationTypes.MISSING_REQUIRED));
        errors.push(new CartoValidationError('\'id\' property must be a string.', CartoValidationTypes.INCORRECT_TYPE));
        errors.push(new CartoValidationError('\'resolution\' must be less than 100.', CartoValidationTypes.INCORRECT_VALUE));
        errors.push(new CartoValidationError(CartoValidationTypes.TOO_MANY_ARGS));
        errors.push(new CartoValidationError(CartoValidationTypes.NOT_ENOUGH_ARGS));
        errors.push(new CartoValidationError(CartoValidationTypes.WRONG_NUMBER_ARGS));

        errors.forEach(error => {
            expect(error instanceof CartoValidationError);
            expect(error.name).toBe('CartoValidationError');
            expect(error.message).toBeTruthy();
        });
    });
});
