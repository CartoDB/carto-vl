import * as _ from 'lodash';

import Base from './base';


export default class Dataset extends Base {

    /**
     * Create a carto.source.Dataset.
     *
     * @param {string} tableName The name of an existing table
     * @param {object} auth
     * @param {string} auth.apiKey - API key used to authenticate against CARTO
     * @param {string} auth.user - Name of the user
     * @param {object} options
     * @param {string} [options.serverURL='https://{user}.carto.com'] - URL of the Maps API server
     *
     * @example
     * new carto.source.Dataset('european_cities', {
     *   apiKey: 'YOUR_API_KEY_HERE',
    *    user: 'YOUR_USERNAME_HERE'
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
        super();
        auth.username = auth.user; // API adapter
        this._checkTableName(tableName);
        this._checkAuth(auth);
        this._checkOptions(options);
        this._tableName = tableName;
        this._apiKey = auth.apiKey;
        this._username = auth.username;
        this._serverURL = (options && options.serverURL) || 'https://{user}.carto.com';
        this._serverURL = this._serverURL.replace(/{user}/, auth.username);
    }

    _checkTableName (tableName) {
        if (_.isUndefined(tableName)) {
            throw new Error('source', 'noDatasetName');
        }
        if (!_.isString(tableName)) {
            throw new Error('source', 'requiredDatasetString');
        }
        if (_.isEmpty(tableName)) {
            throw new Error('source', 'requiredDataset');
        }
    }

    _checkAuth (auth) {
        this._checkApiKey(auth.apiKey);
        this._checkUsername(auth.username);
    }

    _checkApiKey (apiKey) {
        if (!apiKey) {
            throw new Error('source', 'apiKeyRequired');
        }
        if (!_.isString(apiKey)) {
            throw new Error('source', 'apiKeyString');
        }
    }

    _checkUsername (username) {
        if (!username) {
            throw new Error('source', 'usernameRequired');
        }
        if (!_.isString(username)) {
            throw new Error('source', 'usernameString');
        }
    }

    _checkOptions (options) {
        if (options && options.serverURL) {
            this._checkServerURL(options.serverURL);
        }
    }

    _checkServerUrl (serverURL) {
        var urlregex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
        if (!serverURL.match(urlregex)) {
            throw new Error('source', 'nonValidServerURL');
        }
    }
}
