import * as util from '../util';
import Base from './base';
import CartoValidationError from '../error-handling/carto-validation-error';


export default class Dataset extends Base {

    /**
     * Create a carto.source.Dataset.
     *
     * @param {string} tableName - The name of an existing table
     * @param {object} auth
     * @param {string} auth.apiKey - API key used to authenticate against CARTO
     * @param {string} auth.user - Name of the user
     * @param {object} config
     * @param {string} [config.serverURL='https://{user}.carto.com'] - URL of the CARTO Maps API server
     *
     * @example
     * new carto.source.Dataset('european_cities', {
     *   apiKey: 'YOUR_API_KEY_HERE',
     *   user: 'YOUR_USERNAME_HERE'
     * });
     *
     * @fires CartoError
     *
     * @constructor Dataset
     * @extends carto.source.Base
     * @memberof carto.source
     * @api
     */
    constructor(tableName, auth, config) {
        super();
        this._checkTableName(tableName);
        this._tableName = tableName;
        this.initialize(auth, config);
    }

    _checkTableName(tableName) {
        if (util.isUndefined(tableName)) {
            throw new CartoValidationError('source', 'tableNameRequired');
        }
        if (!util.isString(tableName)) {
            throw new CartoValidationError('source', 'tableNameStringRequired');
        }
        if (tableName === '') {
            throw new CartoValidationError('source', 'nonValidTableName');
        }
    }
}
