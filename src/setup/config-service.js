import * as util from '../utils/util';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../src/errors/carto-validation-error';

let defaultConfig;

/**
 * Set default configuration parameters
 *
 * @param {Object} config
 * @param {String} config.serverURL - Template URL of the CARTO Maps API server: `https://{user}.carto.com`
 *
 * @memberof carto
 * @api
 */
function setDefaultConfig (config) {
    checkConfig(config);
    defaultConfig = config;
}

/**
 * Get default config
 * @return {Object}
 */
function getDefaultConfig () {
    return defaultConfig;
}

/**
 * Clean default config object
 */
function cleanDefaultConfig () {
    defaultConfig = undefined;
}

/**
 * Check a valid config parameter.
 *
 * @param  {Object} config
 */
function checkConfig (config) {
    if (config) {
        if (!util.isObject(config)) {
            throw new CartoValidationError(`${cvt.INCORRECT_TYPE} 'config' property must be an object.`);
        }
        _checkServerURL(config.serverURL);
    }
}

function _checkServerURL (serverURL) {
    if (!util.isString(serverURL)) {
        throw new CartoValidationError(`${cvt.INCORRECT_TYPE} 'serverURL' property must be a string.`);
    }
}

export { setDefaultConfig, getDefaultConfig, checkConfig, cleanDefaultConfig };
