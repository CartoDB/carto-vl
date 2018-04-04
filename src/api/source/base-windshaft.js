import Base from './base';
import Windshaft from '../../client/windshaft';
import * as schema from '../../core/schema';
import CartoValidationError from '../error-handling/carto-validation-error';
import { getDefaultAuth, checkAuth } from '../setup/auth-service';
import { getDefaultConfig, checkConfig } from '../setup/config-service';


const DEFAULT_SERVER_URL_TEMPLATE = 'https://{user}.carto.com';

export default class BaseWindshaft extends Base {

    constructor() {
        super();
        this._client = new Windshaft(this);
    }

    initialize(columns, auth, config) {
        columns = columns || {};
        columns = {
            columns: columns.columns || [],
            aggregated_columns: columns.aggregated_columns || {}
        };
        auth = auth || getDefaultAuth();
        config = config || getDefaultConfig();
        this._checkColumns(columns);
        checkAuth(auth);
        checkConfig(config);
        this._columns = columns;
        this._apiKey = auth.apiKey;
        this._username = auth.username;
        this._serverURL = this._generateURL(auth, config);
    }

    bindLayer(...args) {
        this._client._bindLayer(...args);
    }

    requestMetadata(style) {
        return this._client.getMetadata(style);
    }

    requestData(viewport) {
        return this._client.getData(viewport);
    }

    free() {
        this._client.free();
    }

    getMinimumNeededSchema() {
        let columns = this._columns.columns;
        for (let key in this._columns.aggregated_columns) {
            const item = this._columns.aggregated_columns[key];
            columns.push(schema.column.aggregatedName(item.aggregate_function, item.aggregated_column, key));
        }
        return { columns };
    }

    _checkColumns() {
        // TODO
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
