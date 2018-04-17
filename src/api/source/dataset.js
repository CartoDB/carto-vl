import * as util from '../util';
import BaseWindshaft from './base-windshaft';
import CartoValidationError from '../error-handling/carto-validation-error';

export default class Dataset extends BaseWindshaft {

    /**
     * A dataset defines the data that will be displayed in a layer and is equivalent
     * to a table in the server.
     *
     * If you have a table named `european_cities` in your CARTO account you could load all the
     * data in a layer using a `carto.Dataset`.
     *
     * If you want to load data applying a SQL query see {@link carto.source.SQL|carto.source.SQL}.
     *
     * Since tables in the server are protected you must provide valid credentials in order to get access to the data.
     * This can be done {@link carto.setDefaultAuth|setting the default auth} in the carto object or providing an `auth`
     * object with your username and apiKey.
     *
     * If your server is not hosted by CARTO you must add a third parameter that includes the serverURL. This can be done {@link carto.setDefaultConfig|setting the default config} in the carto object or providing a `config`
     * object with your serverURL.
     *
     * @param {string} tableName - The name of an existing table
     * @param {object} auth
     * @param {string} auth.apiKey - API key used to authenticate against CARTO
     * @param {string} auth.user - Name of the user
     * @param {object} config
     * @param {string} [config.serverURL='https://{user}.carto.com'] - URL of the CARTO Maps API server
     *
     * @example
     * const source = new carto.source.Dataset('european_cities', {
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

    _clone(){
        return new Dataset(this._tableName, this._auth, this._config);
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
