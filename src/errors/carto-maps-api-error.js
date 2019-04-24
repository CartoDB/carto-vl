import CartoError from './carto-error';

/**
 * Utility to build a cartoError related to MapsAPI errors.
 *
 * @return {CartoError} A well formed object representing the error.
 */

/**
 * CartoMapsAPIError types:
 * - [Error]
 * - [Not supported]
 * - [Security]
 *
 * @name CartoMapsAPIError
 * @memberof CartoError
 * @api
*/

export default class CartoMapsAPIError extends CartoError {
    constructor (message, type = CartoMapsAPITypes.DEFAULT) {
        super({ message, type });
        this.name = 'CartoMapsAPIError';
    }
}

export const CartoMapsAPITypes = {
    DEFAULT: '[Error]',
    NOT_SUPPORTED: '[Not supported]',
    SECURITY: '[Security]'
};
