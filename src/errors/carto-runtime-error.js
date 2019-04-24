import CartoError from './carto-error';

/**
 * Utility to build a cartoError related to Runtime errors.
 *
 * @return {CartoError} A well formed object representing the error.
 */

/**
 * CartoRuntimeError types:
 * - [Error]
 * - [Not supported]
 * - [WebGL]
 * - [MVT]
 *
 * @name CartoRuntimeError
 * @memberof CartoError
 * @api
*/
export default class CartoRuntimeError extends CartoError {
    constructor (message, type = CartoRuntimeTypes.DEFAULT) {
        super({ message, type });
        this.name = 'CartoRuntimeError';
    }
}

export const CartoRuntimeTypes = {
    DEFAULT: '[Error]',
    NOT_SUPPORTED: '[Not supported]',
    WEB_GL: '[WebGL]',
    MVT: '[MVT]'
};
