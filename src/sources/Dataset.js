import CartoValidationError, { CartoValidationTypes as cvt } from '../../src/errors/carto-validation-error';
import util from '../utils/util';
import BaseWindshaft from './BaseWindshaft';

export default class Dataset extends BaseWindshaft {
    /**
     * A dataset defines the data that will be displayed in a layer and is equivalent
     * to a table in the server.
     *
     * If you have a table named `european_cities` in your CARTO account you could load all the
     * data in a layer using a `carto.source.Dataset`.
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
     * The combination of different type of geometries on the same source is not supported. Valid geometry types are `points`, `lines` and `polygons`.
     *
     * @param {String} tableName - The name of an existing table
     * @param {Object} auth
     * @param {String} auth.apiKey - API key used to authenticate against CARTO
     * @param {String} auth.user - Name of the user
     * @param {Object} config
     * @param {String} [config.serverURL='https://{user}.carto.com'] - URL of the CARTO Maps API server
     *
     * @example
     * const source = new carto.source.Dataset('european_cities', {
     *   apiKey: 'YOUR_API_KEY_HERE',
     *   username: 'YOUR_USERNAME_HERE'
     * });
     *
     * @throws CartoError
     *
     * @memberof carto.source
     * @name Dataset
     * @api
     */
    constructor (tableName, auth, config) {
        super();
        this._checkTableName(tableName);
        this._tableName = tableName;
        this.initialize(auth, config);
    }

    _getFromClause () {
        return this._tableName;
    }

    _clone () {
        return new Dataset(this._tableName, this._auth, this._config);
    }

    _checkTableName (tableName) {
        if (util.isUndefined(tableName)) {
            throw new CartoValidationError(`${cvt.MISSING_REQUIRED} 'tableName'`);
        }
        if (!util.isString(tableName)) {
            throw new CartoValidationError(`${cvt.INCORRECT_TYPE} 'tableName' property must be a string.`);
        }
        if (tableName === '') {
            throw new CartoValidationError(`${cvt.INCORRECT_VALUE} 'tableName' property must be not empty.`);
        }
    }
}
