import { CartoError } from './carto-error';

/**
 * Utility to build a cartoError related to security errors.
 *
 * @return {CartoError} A well formed object representing the error.
 */
export default class CartoSecurityError extends CartoError {
    constructor (type, message) {
        super({
            origin: 'security',
            type: type,
            message: message
        });
    }
}
