import * as _ from 'lodash';

import Base from './base';


export default class Dataset extends Base {

    /**
     * Create a carto.source.Dataset.
     *
     * @param {string} tableName - The name of an existing table
     * @param {object} auth
     * @param {string} auth.apiKey - API key used to authenticate against CARTO
     * @param {string} auth.user - Name of the user
     * @param {object} options
     * @param {string} [options.serverURL='https://{user}.carto.com'] - URL of the Maps API server
     *
     * @example
     * new carto.source.Dataset('european_cities', {
     *   apiKey: 'YOUR_API_KEY_HERE',
     *   user: 'YOUR_USERNAME_HERE'
     * });
     *
     * @fires Error
     *
     * @constructor Dataset
     * @extends carto.source.Base
     * @memberof carto.source
     * @api
     */
    constructor(tableName, auth, options) {
        super(auth, options);
        this._checkTableName(tableName);
        this._tableName = tableName;
    }

    _checkTableName (tableName) {
        if (_.isUndefined(tableName)) {
            throw new Error('source', 'tableNameRequired');
        }
        if (!_.isString(tableName)) {
            throw new Error('source', 'tableNameString');
        }
        if (_.isEmpty(tableName)) {
            throw new Error('source', 'nonValidTableName');
        }
    }
}
