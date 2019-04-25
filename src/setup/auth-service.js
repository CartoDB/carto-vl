import * as util from '../utils/util';
import CartoValidationError, { CartoValidationErrorTypes } from '../../src/errors/carto-validation-error';

let defaultAuth;

/**
 * Set default authentication parameters: [user or username] and apiKey.
 *
 * @param {Object} auth
 * @param {String} auth.username - Name of the user. For backwards compatibility also `auth.user` is allowed
 * @param {String} auth.apiKey - API key used to authenticate against CARTO
 *
 * @memberof carto
 * @api
 */
function setDefaultAuth (auth) {
    checkAuth(auth);
    defaultAuth = auth;
}

/**
 * Get default authentication
 * @return {Object}
 */
function getDefaultAuth () {
    return defaultAuth;
}

/**
 * Reset the default auth object
 */
function cleanDefaultAuth () {
    defaultAuth = undefined;
}

/**
 * Check a valid auth parameter.
 *
 * @param  {Object} auth
 */
function checkAuth (auth) {
    if (util.isUndefined(auth)) {
        throw new CartoValidationError('\'auth\'', CartoValidationErrorTypes.MISSING_REQUIRED);
    }
    if (!util.isObject(auth)) {
        throw new CartoValidationError('\'auth\' property must be an object.', CartoValidationErrorTypes.INCORRECT_TYPE);
    }
    auth.username = util.isUndefined(auth.username) ? auth.user : auth.username; // backwards compatibility
    checkApiKey(auth.apiKey);
    checkUsername(auth.username);
}

function checkApiKey (apiKey) {
    if (util.isUndefined(apiKey)) {
        throw new CartoValidationError('\'apiKey\'', CartoValidationErrorTypes.MISSING_REQUIRED);
    }
    if (!util.isString(apiKey)) {
        throw new CartoValidationError('\'apiKey\' property must be a string.', CartoValidationErrorTypes.INCORRECT_TYPE);
    }
    if (apiKey === '') {
        throw new CartoValidationError('\'apiKey\' property must be not empty.', CartoValidationErrorTypes.INCORRECT_VALUE);
    }
}

function checkUsername (username) {
    if (util.isUndefined(username)) {
        throw new CartoValidationError('\'username\'', CartoValidationErrorTypes.MISSING_REQUIRED);
    }
    if (!util.isString(username)) {
        throw new CartoValidationError('\'username\' property must be a string.', CartoValidationErrorTypes.INCORRECT_TYPE);
    }
    if (username === '') {
        throw new CartoValidationError('\'username\' property must be not empty.', CartoValidationErrorTypes.INCORRECT_VALUE);
    }
}

export { setDefaultAuth, getDefaultAuth, checkAuth, cleanDefaultAuth };
