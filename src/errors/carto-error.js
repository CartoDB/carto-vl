/**
 * Represents an error in the carto library.
 *
 * @typedef {object} CartoError
 * @property {string} message - A short error description
 * @property {string} name - The name of the error "CartoError"
 * @property {object} originalError - An object containing the internal/original error
 *
 * @event CartoError
 * @api
 */
export default class CartoError extends Error {
    /**
     * Build a cartoError from a generic error.
     * @constructor
     *
     * @return {CartoError} A well formed object representing the error.
     */
    constructor (error) {
        if (!(error && error.message)) {
            throw Error('Invalid CartoError, a message is mandatory');
        }
        super(error.message);
        this.name = 'CartoError';
        this.originalError = error;
    }
}
