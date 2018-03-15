import Base from './base';
import Windshaft from '../../client/windshaft';
import CartoValidationError from '../error-handling/carto-validation-error';
import { getDefaultAuth, checkAuth } from '../setup/auth-service';
import { getDefaultConfig, checkConfig } from '../setup/config-service';


const DEFAULT_SERVER_URL_TEMPLATE = 'https://{user}.carto.com';

export default class BaseWindshaft extends Base {

    constructor() {
        super();
        this._client = new Windshaft(this);
    }

    initialize(auth, config) {
        auth = auth || getDefaultAuth();
        config = config || getDefaultConfig();
        checkAuth(auth);
        checkConfig(config);
        this._apiKey = auth.apiKey;
        this._username = auth.username;
        this._serverURL = this._generateURL(auth, config);
    }

    bindLayer(...args) {
        this._client._bindLayer(...args);
    }

    requestData(viewport, style) {
        return this._client.getData(viewport, style);
    }

    free() {
        this._client.free();
    }

    _generateURL(auth, config) {
        let url = (config && config.serverURL) || DEFAULT_SERVER_URL_TEMPLATE;
        url = url.replace(/{user}/, auth.username);
        this._validateServerURL(url.replace(/{local}/, ''));
        return {
            maps: url.replace(/{local}/, ':8181'),
            sql:  url.replace(/{local}/, ':8080')
        };
    }

    _validateServerURL(serverURL) {
        var urlregex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
        if (!serverURL.match(urlregex)) {
            throw new CartoValidationError('source', 'nonValidServerURL');
        }
    }
}
