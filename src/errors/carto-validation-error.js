import CartoError from './carto-error';

/**
 * Utility to build a cartoError related to validation errors.
 *
 * @return {CartoError} A well formed object representing the error.
 */
export default class CartoValidationError extends CartoError {
    constructor (message, type = CartoValidationTypes.DEFAULT) {
        super({ message, type });
        this.name = 'CartoValidationError';
    }
}

export const CartoValidationTypes = {
    DEFAULT: '[Error]:',
    MISSING_REQUIRED: '[Missing required property]:',
    INCORRECT_TYPE: '[Property with an incorrect type]:',
    INCORRECT_VALUE: '[Incorrect value]:',
    TOO_MANY_ARGS: '[Too many arguments]:',
    NOT_ENOUGH_ARGS: '[Not enough arguments]:',
    WRONG_NUMBER_ARGS: '[Wrong number of arguments]:'
};
