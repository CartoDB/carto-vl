import * as util from '../util';
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
 * Get default config
 * @return {object}
 */
function getDefaultConfig() {
    return defaultConfig;
}

/**
 * Clean default config object
 */
function cleanDefaultConfig() {
    defaultConfig = undefined;
}

/**
 * Check a valid config parameter.
 *
 * @param  {object} config
 */
function checkConfig(config) {
    if (config) {
        if (!util.isObject(config)) {
            throw new CartoValidationError('setup', 'configObjectRequired');
        }
        _checkServerURL(config.serverURL);
    }
}

function _checkServerURL(serverURL) {
    if (!util.isString(serverURL)) {
        throw new CartoValidationError('setup', 'serverURLStringRequired');
    }
}

export { setDefaultConfig, getDefaultConfig, checkConfig, cleanDefaultConfig };
