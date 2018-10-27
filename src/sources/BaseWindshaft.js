import Base from './Base';
import Windshaft from '../client/windshaft';
import { getDefaultAuth, checkAuth } from '../setup/auth-service';
import { getDefaultConfig, checkConfig } from '../setup/config-service';

const DEFAULT_SERVER_URL_TEMPLATE = 'https://{user}.carto.com';

export default class BaseWindshaft extends Base {
    constructor () {
        super();
        this._client = new Windshaft(this);
    }

    initialize (auth, config) {
        this._auth = auth || getDefaultAuth();
        this._config = config || getDefaultConfig();
        checkAuth(this._auth);
        checkConfig(this._config);
        this._apiKey = this._auth.apiKey;
        this._username = this._auth.username;
        this._serverURL = this._generateURL(this._auth, this._config);
    }

    bindLayer (addDataframe) {
        this._client.bindLayer(addDataframe);
    }

    requiresNewMetadata (viz) {
        return this._client.requiresNewMetadata(viz);
    }

    requestMetadata (viz) {
        return this._client.getMetadata(viz);
    }

    requestData (zoom, viewport) {
        return this._client.getData(zoom, viewport);
    }

    free () {
        this._client.free();
    }

    _generateURL (auth, config) {
        let url = (config && config.serverURL) || DEFAULT_SERVER_URL_TEMPLATE;
        url = url.replace(/{user}/, auth.username);
        return url;
    }
}
