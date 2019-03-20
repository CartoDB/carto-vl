import CartoError from '../../../src/errors/carto-error';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../src/errors/carto-validation-error';

describe('errors/CartoValidationError', () => {
    it('should allow a simple error', () => {
        const error = new CartoValidationError('my error');

        expect(error instanceof CartoError);
        expect(error instanceof CartoValidationError);
        expect(error.name).toBe('CartoValidationError');
        expect(error.message).toBe('my error');
    });

    it('shouldn\'t allow an error without a message', () => {
        expect(() => new CartoValidationError()).toThrow();
    });

    it('should allow an error message using several predefined categories', () => {
        const errors = [];
        errors.push(new CartoValidationError(`${cvt.MISSING_REQUIRED} 'id'`));
        errors.push(new CartoValidationError(`${cvt.INCORRECT_TYPE} 'id' property must be a string.`));
        errors.push(new CartoValidationError(`${cvt.INCORRECT_VALUE} 'resolution' must be less than 100.`));
        errors.push(new CartoValidationError(cvt.TOO_MANY_ARGS));
        errors.push(new CartoValidationError(cvt.NOT_ENOUGH_ARGS));
        errors.push(new CartoValidationError(cvt.WRONG_NUMBER_ARGS));

        errors.forEach(error => {
            expect(error instanceof CartoValidationError);
            expect(error.name).toBe('CartoValidationError');
            expect(error.message).toBeTruthy();
        });
    });
});
