import * as _ from 'lodash';

import CartoValidationError from '../error-handling/carto-validation-error';


let defaultAuth = undefined;

/**
 * Set default authentication parameters: apiKey and user.
 *
 * @param {object} auth
 * @param {string} auth.apiKey - API key used to authenticate against CARTO
 * @param {string} auth.user - Name of the user
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
 * Reset the auth object
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
    if (_.isUndefined(auth)) {
        throw new CartoValidationError('setup', 'authRequired');
    }
    if (!_.isObject(auth)) {
        throw new CartoValidationError('setup', 'authObjectRequired');
    }
    auth.username = auth.user; // API adapter
    checkApiKey(auth.apiKey);
    checkUsername(auth.username);
}

function checkApiKey(apiKey) {
    if (_.isUndefined(apiKey)) {
        throw new CartoValidationError('setup', 'apiKeyRequired');
    }
    if (!_.isString(apiKey)) {
        throw new CartoValidationError('setup', 'apiKeyStringRequired');
    }
    if (_.isEmpty(apiKey)) {
        throw new CartoValidationError('setup', 'nonValidApiKey');
    }
}

function checkUsername(username) {
    if (_.isUndefined(username)) {
        throw new CartoValidationError('setup', 'usernameRequired');
    }
    if (!_.isString(username)) {
        throw new CartoValidationError('setup', 'usernameStringRequired');
    }
    if (_.isEmpty(username)) {
        throw new CartoValidationError('setup', 'nonValidUsername');
    }
}

export { setDefaultAuth, getDefaultAuth, checkAuth, cleanDefaultAuth };
