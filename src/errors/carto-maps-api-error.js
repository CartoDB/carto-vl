import CartoError from './carto-error';

/**
 * Utility to build a cartoError related to MapsAPI errors.
 *
 * @return {CartoError} A well formed object representing the error.
 */
export default class CartoMapsAPIError extends CartoError {
    constructor (message) {
        super({ message: message });
        this.name = 'CartoMapsAPIError';
    }
}

export const CartoMapsAPITypes = {
    NOT_SUPPORTED: '[Not supported]:',
    SECURITY: '[Security]:'
};
