import CartoValidationError, { CartoValidationTypes as cvt } from '../../src/errors/carto-validation-error';
import util from '../utils/util';
import BaseWindshaft from './BaseWindshaft';

export default class SQL extends BaseWindshaft {
    /**
     * A SQL defines the data that will be displayed in a layer.
     *
     * Imagine you have a table named `european_cities` and you only want to download data from european cities with population > 100000
     *
     * ```javascript
     * const source = new carto.source.SQL(`SELECT * FROM european_cities WHERE country like 'europe' AND population > 10000`, {
     *   apiKey: 'YOUR_API_KEY_HERE',
     *   username: 'YOUR_USERNAME_HERE'
     * });
     * ````
     *
     * This only downloads the data you need from the server reducing data usage.
     *
     * If you need all the data see {@link carto.source.Dataset|carto.source.Dataset}.
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
     * @param {String} query - A SQL query containing a SELECT statement
     * @param {Object} auth
     * @param {String} auth.apiKey - API key used to authenticate against CARTO
     * @param {String} auth.user - Name of the user
     * @param {Object} config
     * @param {String} [config.serverURL='https://{user}.carto.com'] - URL of the CARTO Maps API server
     *
     * @example
     * const source = new carto.source.SQL('SELECT * FROM european_cities', {
     *   apiKey: 'YOUR_API_KEY_HERE',
     *   username: 'YOUR_USERNAME_HERE'
     * });
     *
     * @throws CartoError
     *
     * @memberof carto.source
     * @name SQL
     * @api
     */
    constructor (query, auth, config) {
        super();
        this._checkQuery(query);
        this._query = query;
        this.initialize(auth, config);
    }

    _getFromClause () {
        return `(${this._query}) as _cdb_query_wrapper`;
    }

    _clone () {
        return new SQL(this._query, this._auth, this._config);
    }

    _checkQuery (query) {
        if (util.isUndefined(query)) {
            throw new CartoValidationError(`${cvt.MISSING_REQUIRED} 'query'`);
        }
        if (!util.isString(query)) {
            throw new CartoValidationError(`${cvt.INCORRECT_TYPE} 'query' property must be a string.`);
        }
        if (query === '') {
            throw new CartoValidationError(`${cvt.INCORRECT_VALUE} 'query' property must be not empty.`);
        }
        let sqlRegex = /\bSELECT\b/i;
        if (!query.match(sqlRegex)) {
            throw new CartoValidationError(`${cvt.INCORRECT_VALUE} 'query' property must be a SQL query.`);
        }
    }
}
