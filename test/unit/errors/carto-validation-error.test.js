import CartoError from '../../../src/errors/carto-error';
import CartoValidationError, { CartoValidationErrorTypes } from '../../../src/errors/carto-validation-error';

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
        errors.push(new CartoValidationError('\'id\'', CartoValidationErrorTypes.MISSING_REQUIRED));
        errors.push(new CartoValidationError('\'id\' property must be a string.', CartoValidationErrorTypes.INCORRECT_TYPE));
        errors.push(new CartoValidationError('\'resolution\' must be less than 100.', CartoValidationErrorTypes.INCORRECT_VALUE));
        errors.push(new CartoValidationError(CartoValidationErrorTypes.TOO_MANY_ARGS));
        errors.push(new CartoValidationError(CartoValidationErrorTypes.NOT_ENOUGH_ARGS));
        errors.push(new CartoValidationError(CartoValidationErrorTypes.WRONG_NUMBER_ARGS));

        errors.forEach(error => {
            expect(error instanceof CartoValidationError);
            expect(error.name).toBe('CartoValidationError');
            expect(error.message).toBeTruthy();
        });
    });
});
