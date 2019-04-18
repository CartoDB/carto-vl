import { version } from '../../package';

const REQUEST_GET_MAX_URL_LENGTH = 2048;

export default class WinshaftRequestHelper {
    constructor (conf, mapConfig) {
        this._conf = conf;
        this._mapConfig = mapConfig;

        this._auth = this._encodeParameter('api_key', this._conf.apiKey);
        this._client = this._encodeParameter('client', `vl-${version}`);
    }

    getMapRequest () {
        const parameters = [this._auth, this._client, this._encodeParameter('config', this._mapConfigPayload())];
        const url = this._generateUrl(this._generateMapsApiUrl(), parameters);
        if (url.length < REQUEST_GET_MAX_URL_LENGTH) {
            return this._getRequest(url);
        }

        return this._postRequest();
    }

    _mapConfigPayload () {
        return JSON.stringify(this._mapConfig);
    }

    _getRequest (url) {
        return new Request(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    _postRequest () {
        const parameters = [this._auth, this._client];

        return new Request(this._generateUrl(this._generateMapsApiUrl(), parameters), {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: this._mapConfigPayload()
        });
    }

    _encodeParameter (name, value) {
        return `${name}=${encodeURIComponent(value)}`;
    }

    _generateUrl (url, parameters = []) {
        return `${url}?${parameters.join('&')}`;
    }

    _generateMapsApiUrl (path) {
        let url = `${this._conf.serverURL}/api/v1/map`;
        if (path) {
            url += path;
        }
        return url;
    }
}
