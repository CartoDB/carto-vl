import * as util from '../utils/util';
import CartoValidationError from '../errors/carto-validation-error';

let defaultAuth = undefined;

/**
 * Set default authentication parameters: user and apiKey.
 *
 * @param {object} auth
 * @param {string} auth.user - Name of the user
 * @param {string} auth.apiKey - API key used to authenticate against CARTO
 *
 * @memberof carto
 * @api
 */
function setDefaultAuth(auth) {
    checkAuth(auth);
    defaultAuth = auth;
}

/**
 * Get default authentication
 * @return {object}
 */
function getDefaultAuth() {
    return defaultAuth;
}

/**
 * Reset the default auth object
 */
function cleanDefaultAuth() {
    defaultAuth = undefined;
}

/**
 * Check a valid auth parameter.
 *
 * @param  {object} auth
 */
function checkAuth(auth) {
    if (util.isUndefined(auth)) {
        throw new CartoValidationError('setup', 'authRequired');
    }
    if (!util.isObject(auth)) {
        throw new CartoValidationError('setup', 'authObjectRequired');
    }
    auth.username = auth.user; // API adapter
    checkApiKey(auth.apiKey);
    checkUsername(auth.username);
}

function checkApiKey(apiKey) {
    if (util.isUndefined(apiKey)) {
        throw new CartoValidationError('setup', 'apiKeyRequired');
    }
    if (!util.isString(apiKey)) {
        throw new CartoValidationError('setup', 'apiKeyStringRequired');
    }
    if (apiKey === '') {
        throw new CartoValidationError('setup', 'nonValidApiKey');
    }
}

function checkUsername(username) {
    if (util.isUndefined(username)) {
        throw new CartoValidationError('setup', 'usernameRequired');
    }
    if (!util.isString(username)) {
        throw new CartoValidationError('setup', 'usernameStringRequired');
    }
    if (username === '') {
        throw new CartoValidationError('setup', 'nonValidUsername');
    }
}

export { setDefaultAuth, getDefaultAuth, checkAuth, cleanDefaultAuth };
