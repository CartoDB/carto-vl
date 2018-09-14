import CartoError from './carto-error';

/**
 * Utility to build a cartoError related to Parsing errors.
 *
 * @return {CartoError} A well formed object representing the error.
 */
export default class CartoParsingError extends CartoError {
    constructor (message) {
        super({ message: message });
        this.name = 'CartoParsingError';
    }
}
