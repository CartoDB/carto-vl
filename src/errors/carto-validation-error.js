import { CartoError } from './carto-error';

/**
 * Utility to build a cartoError related to validation errors.
 *
 * @return {CartoError} A well formed object representing the error.
 */
export default class CartoValidationError extends CartoError {
    constructor(type, message) {
        super({
            origin: 'validation',
            type: type,
            message: message
        });
    }
}
