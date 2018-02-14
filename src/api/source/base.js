import * as _ from 'lodash';

import Windshaft from '../../client/windshaft';
import CartoValidationError from '../error-handling/carto-validation-error';


export default class Base {

    /**
     * Base data source object.
     *
     * The methods listed in the {@link carto.source.Base|source.Base} object are availiable in all source objects.
     *
     * Use a source to reference the data used in a {@link carto.layer.Base|layer}.
     *
     * {@link carto.source.Base} should not be used directly use {@link carto.source.Dataset} or {@link carto.source.SQL} instead.
     *
     * @fires error
     *
     * @constructor Base
     * @abstract
     * @memberof carto.source
     * @api
     */
    constructor(auth, options) {
        this._checkAuth(auth);
        this._checkOptions(options);
        this._apiKey = auth.apiKey;
        this._username = auth.username;
        this._serverURL = (options && options.serverURL) || 'https://{user}.carto.com';
        this._serverURL = this._serverURL.replace(/{user}/, auth.username);
        this._validateServerURL(this._serverURL);

        this._client = new Windshaft(this);
    }

    bindLayer(...args) {
        this._client._bindLayer(...args);
    }

    requestData(viewport, mns) {
        return this._client._getData(viewport, mns);
    }

    _checkAuth (auth) {
        if (_.isUndefined(auth)) {
            throw new CartoValidationError('source', 'authRequired');
        }
        if (!_.isObject(auth)) {
            throw new CartoValidationError('source', 'authObjectRequired');
        }
        auth.username = auth.user; // API adapter
        this._checkApiKey(auth.apiKey);
        this._checkUsername(auth.username);
    }

    _checkApiKey (apiKey) {
        if (_.isUndefined(apiKey)) {
            throw new CartoValidationError('source', 'apiKeyRequired');
        }
        if (!_.isString(apiKey)) {
            throw new CartoValidationError('source', 'apiKeyStringRequired');
        }
        if (_.isEmpty(apiKey)) {
            throw new CartoValidationError('source', 'nonValidApiKey');
        }
    }

    _checkUsername (username) {
        if (_.isUndefined(username)) {
            throw new CartoValidationError('source', 'usernameRequired');
        }
        if (!_.isString(username)) {
            throw new CartoValidationError('source', 'usernameStringRequired');
        }
        if (_.isEmpty(username)) {
            throw new CartoValidationError('source', 'nonValidUsername');
        }
    }

    _checkOptions (options) {
        if (options) {
            if (!_.isObject(options)) {
                throw new CartoValidationError('source', 'optionsObjectRequired');
            }
            this._checkServerURL(options.serverURL);
        }
    }

    _checkServerURL (serverURL) {
        if (!_.isString(serverURL)) {
            throw new CartoValidationError('source', 'serverURLStringRequired');
        }
    }

    _validateServerURL (serverURL) {
        var urlregex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
        if (!serverURL.match(urlregex)) {
            throw new CartoValidationError('source', 'nonValidServerURL');
        }
    }
}
