import * as _ from 'lodash';

import Base from './base';
import CartoValidationError from '../error-handling/carto-validation-error';


export default class SQL extends Base {

    /**
     * Create a carto.source.Dataset.
     *
     * @param {string} query - A SQL query containing a SELECT statement
     * @param {object} auth
     * @param {string} auth.apiKey - API key used to authenticate against CARTO
     * @param {string} auth.user - Name of the user
     * @param {object} options
     * @param {string} [options.serverURL='https://{user}.carto.com'] - URL of the CARTO Maps API server
     *
     * @example
     * new carto.source.SQL('SELECT * FROM european_cities', {
     *   apiKey: 'YOUR_API_KEY_HERE',
     *   user: 'YOUR_USERNAME_HERE'
     * });
     *
     * @fires Error
     *
     * @constructor SQL
     * @extends carto.source.Base
     * @memberof carto.source
     * @api
     */
    constructor(query, auth, options) {
        super();
        this._checkQuery(query);
        this._query = query;
        this.initialize(auth, options);
    }

    _checkQuery(query) {
        if (_.isUndefined(query)) {
            throw new CartoValidationError('source', 'queryRequired');
        }
        if (!_.isString(query)) {
            throw new CartoValidationError('source', 'queryStringRequired');
        }
        if (_.isEmpty(query)) {
            throw new CartoValidationError('source', 'nonValidQuery');
        }
        var sqlRegex = /(SELECT|select)\s+.*\s+(FROM|from)\s+.*/;
        if (!query.match(sqlRegex)) {
            throw new CartoValidationError('source', 'nonValidSQLQuery');
        }
    }
}
