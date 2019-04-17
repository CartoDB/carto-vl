import CartoError from './carto-error';

/**
 * Utility to build a cartoError related to MapsAPI errors.
 *
 * @return {CartoError} A well formed object representing the error.
 */
export default class CartoMapsAPIError extends CartoError {
    constructor (type=CartoMapsAPITypes.DEFAULT, message) {
        super({ message });
        this.name = 'CartoMapsAPIError';
        this.type = type;
    }
}

export const CartoMapsAPITypes = {
    DEFAULT: '[Error]:',
    NOT_SUPPORTED: '[Not supported]:',
    SECURITY: '[Security]:'
};
