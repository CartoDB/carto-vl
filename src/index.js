/**
 *  @api
 *  @namespace carto
 *
 *  @description
 *  # CARTO GL
 *  All the library features are exposed through the `carto` namespace.
 *
 */

// Temporary for debug
const R = require('./core');
const MGL = require('./api/mapboxgl');
const WindshaftSQL = require('./api/windshaft-sql');

const carto = {
    version: require('../package.json').version,
    R: R,
    MGL: MGL,
    WindshaftSQL: WindshaftSQL
};

module.exports = carto;
