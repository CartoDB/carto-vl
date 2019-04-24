import CartoError from './carto-error';

/**
 * Utility to build a cartoError related to Parsing errors.
 *
 * @return {CartoError} A well formed object representing the error.
 */

/**
 * CartoParsingError types:
 * - [Error]
 *
 * @name CartoParsingError
 * @memberof CartoError
 * @api
*/

export default class CartoParsingError extends CartoError {
    constructor (message) {
        const type = '[Error]';
        super({ message, type });
        this.name = 'CartoParsingError';
    }
}
