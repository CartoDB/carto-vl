import * as ERROR_LIST from './error-list';

const UNEXPECTED_ERROR = 'unexpected error';
const GENERIC_ORIGIN = 'generic';

/**
 * Represents an error in the carto library.
 *
 * @typedef {object} CartoError
 * @property {string} message - A short error description
 * @property {string} name - The name of the error "CartoError"
 * @property {string} origin - Where the error was originated: 'validation'
 * @property {object} originalError - An object containing the internal/original error
 * @property {object} stack - Error stack trace
 * @property {string} type - Error type
 * @api
 */
class CartoError extends Error {
    /**
     * Build a cartoError from a generic error.
     * @constructor
     *
     * @return {CartoError} A well formed object representing the error.
     */
    constructor(error) {
        super((error && error.message) || UNEXPECTED_ERROR);

        this.name = 'CartoError';
        this.originalError = error;
        // this.stack = (new Error()).stack;
        this.type = (error && error.type) || '';
        this.origin = (error && error.origin) || GENERIC_ORIGIN;

        // Add extra fields
        var extraFields = this._getExtraFields();
        this.message = extraFields.friendlyMessage;
    }

    _getExtraFields() {
        const errorList = this._getErrorList();
        for (let key in errorList) {
            const error = errorList[key];
            if (!(error.messageRegex instanceof RegExp)) {
                throw new Error(`MessageRegex on ${key} is not a RegExp.`);
            }
            if (error.messageRegex.test(this.message)) {
                return {
                    friendlyMessage: error.friendlyMessage
                };
            }
        }

        // When cartoError not found return generic values
        return {
            friendlyMessage: this.message || ''
        };
    }

    _getErrorList() {
        return ERROR_LIST[this.origin] && ERROR_LIST[this.origin][this.type];
    }
}

export { CartoError };
