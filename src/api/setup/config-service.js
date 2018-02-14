import * as _ from 'lodash';

import CartoValidationError from '../error-handling/carto-validation-error';


let defaultConfig = undefined;

/**
 * Set default configuration parameters: serverURL.
 *
 * @param {object} options
 * @param {string} [options.serverURL='https://{user}.carto.com'] - URL of the CARTO Maps API server
 *
 * @memberof carto
 * @api
 */
function setDefaultConfig(config) {
    checkConfig(config);
    defaultConfig = config;
}

/**
 * Get default authentication
 * @return {object}
 */
function getDefaultConfig() {
    return defaultConfig;
}

/**
 * Check a valid config parameter.
 *
 * @param  {object} config
 */
function checkConfig(config) {
    if (config) {
        if (!_.isObject(config)) {
            throw new CartoValidationError('setup', 'configObjectRequired');
        }
        checkServerURL(config.serverURL);
    }
}

function checkServerURL(serverURL) {
    if (!_.isString(serverURL)) {
        throw new CartoValidationError('setup', 'serverURLStringRequired');
    }
}

export { setDefaultConfig, getDefaultConfig, checkConfig };
