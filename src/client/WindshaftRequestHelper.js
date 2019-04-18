import { version } from '../../package';
import CartoMapsAPIError, { CartoMapsAPITypes as cmt } from '../errors/carto-maps-api-error';

const REQUEST_GET_MAX_URL_LENGTH = 2048;

export default class WinshaftRequestHelper {
    constructor (conf, mapConfig) {
        this._conf = conf;
        this._mapConfig = mapConfig;

        this._auth = this._encodeParameter('api_key', this._conf.apiKey);
        this._client = this._encodeParameter('client', `vl-${version}`);
    }

    async getMapRequest () {
        let response;
        try {
            response = await fetch(this._makeHttpRequest());
        } catch (error) {
            throw new CartoMapsAPIError(`Failed to connect to Maps API with your user('${this._source._username}')`);
        }

        const layergroup = await response.json();
        if (!response.ok) {
            this._dealWithWindshaftErrors(response, layergroup);
        }

        return layergroup;
    }

    _makeHttpRequest () {
        const parameters = [this._auth, this._client, this._encodeParameter('config', this._mapConfigPayload())];
        const url = this._generateUrl(this._generateMapsApiUrl(), parameters);
        if (url.length < REQUEST_GET_MAX_URL_LENGTH) {
            return this._getRequest(url);
        }

        return this._postRequest();
    }

    _dealWithWindshaftErrors (response, layergroup) {
        if (response.status === 401) {
            throw new CartoMapsAPIError(
                `${cmt.SECURITY} Unauthorized access to Maps API: invalid combination of user('${this._source._username}') and apiKey('${this._source._apiKey}')`
            );
        } else if (response.status === 403) {
            throw new CartoMapsAPIError(
                `${cmt.SECURITY} Unauthorized access to dataset: the provided apiKey('${this._source._apiKey}') doesn't provide access to the requested data`
            );
        }
        throw new CartoMapsAPIError(`SQL errors: ${JSON.stringify(layergroup.errors)}`);
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
