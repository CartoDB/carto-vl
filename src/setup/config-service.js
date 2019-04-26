import * as util from '../utils/util';
import CartoValidationError, { CartoValidationErrorTypes } from '../../src/errors/carto-validation-error';

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
            throw new CartoValidationError('\'config\' property must be an object.', CartoValidationErrorTypes.INCORRECT_TYPE);
        }
        _checkServerURL(config.serverURL);
    }
}

function _checkServerURL (serverURL) {
    if (!util.isString(serverURL)) {
        throw new CartoValidationError('\'serverURL\' property must be a string.', CartoValidationErrorTypes.INCORRECT_TYPE);
    }
}

export { setDefaultConfig, getDefaultConfig, checkConfig, cleanDefaultConfig };
