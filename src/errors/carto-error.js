/**
 * Represents an error in the carto library.
 *
 * @typedef {Object} CartoError
 * @property {String} message - A short error description
 * @property {String} name - The name of the error "CartoError"
 * @property {String} type - The type of the error "CartoError"
 * @property {Object} originalError - An object containing the internal/original error
 *
 * @event CartoError
 * @api
 */

/**
 * @namespace CartoErrors
 * @api
 *
*/
export default class CartoError extends Error {
    /**
     * Build a cartoError from a generic error.
     * @constructor
     *
     * @return {CartoError} A well formed object representing the error.
     */
    constructor (error) {
        if (!error) {
            throw Error('Invalid CartoError, a message is mandatory');
        }

        if (!error.message) {
            throw Error('Invalid CartoError, a message is mandatory');
        }

        if (!error.type) {
            throw Error('Invalid CartoError, a type is mandatory');
        }

        super(`${error.type} ${error.message}`);
        this.name = 'CartoError';
        this.type = error.type;
        this.originalError = error;
    }
}
