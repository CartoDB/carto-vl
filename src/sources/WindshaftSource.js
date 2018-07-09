import schema from '../renderer/schema';
import Base from './Base';
import { validateServerURL } from '../utils/url';
import { getDefaultAuth, checkAuth } from '../setup/auth-service';
import { getDefaultConfig, checkConfig } from '../setup/config-service';
import * as windshaftFiltering from '../client/windshaft/windshaft-filtering';
import WindshaftClient from '../client/windshaft/WindshaftClient';
import MvtClient from '../client/MvtClient';

const MIN_FILTERING = 2000000;
const DEFAULT_SERVER_URL_TEMPLATE = 'https://{user}.carto.com';
export default class WindshaftSource extends Base {

    constructor() {
        super();
        this._windshaftClient = new WindshaftClient(this);
        this._mvtClient; // Will be initialized later
    }

    bindLayer(addDataframe, dataLoadedCallback) {
        this._onDataFrameLoaded = addDataframe;
        this._onDataLoaded = dataLoadedCallback;

        this._mvtClient.setCallbacks({
            onDataFrameLoaded: this._onDataFrameLoaded,
            onDataLoaded: this._onDataLoaded
        });
    }

    /**
     * Check if the metadata is still valid for the given viz object, otherwise
     * new metadata needs to be downloaded.
     * @param {Viz} viz 
     */
    requiresNewMetadata(viz) {
        const { minimunNeededSchema, resolution, filtering } = this._getVizProperties(viz);
        return this._needToInstantiate(minimunNeededSchema, resolution, filtering);
    }

    async requestMetadata(viz) {
        const { minimunNeededSchema, resolution, filtering } = this._getVizProperties(viz);
        if (this._needToInstantiate(minimunNeededSchema, resolution, filtering)) {
            const instantiationData = await this._windshaftClient.instantiateMap(minimunNeededSchema, resolution, filtering);
            this._updateStateAfterInstantiating(instantiationData);
        }
        return this.metadata;
    }

    requestData(viewport) {
        return this._mvtClient.requestData(viewport);
    }

    free() {
        this._mvtClient && this._mvtClient.free();
    }

    _updateStateAfterInstantiating({ MNS, resolution, filters, metadata, url, subdomains }) {
        if (this._mvtClient) {
            this._mvtClient.free();
        }
        const templateURL = this._buildTemplateUrl(url, subdomains);

        this._mvtClient = this._initMvtClient(templateURL, metadata);
        this.metadata = metadata;
        this._MNS = MNS;
        this.filtering = filters;
        this.resolution = resolution;
    }

    _initMvtClient(templateURL, metadata) {
        const mvtClient = new MvtClient(templateURL, metadata);
        mvtClient.setCallbacks({
            onDataFrameLoaded: this._onDataFrameLoaded,
            onDataLoaded: this._onDataLoaded
        });
        mvtClient.decodeProperty = (propertyName, propertyValue) => {
            const basename = schema.column.getBase(propertyName);
            const column = this.metadata.properties[basename];
            if (!column) {
                return;
            }
            switch (column.type) {
                case 'date':
                {
                    const d = new Date();
                    d.setTime(1000 * propertyValue);
                    const min = column.min;
                    const max = column.max;
                    const n = (d - min) / (max.getTime() - min.getTime());
                    return n;
                }
                case 'category':
                    return this.metadata.categorizeString(propertyValue);
                case 'number':
                    return propertyValue;
                default:
                    throw new Error(`Windshaft MVT decoding error. Feature property value of type '${typeof propertyValue}' cannot be decoded.`);
            }
        };
        return mvtClient;
    }

    _buildTemplateUrl(url, subdomains){
        let templateURL = subdomains.map(s => url.replace('{s}', s));
        if (subdomains.length === 0) {
            templateURL = url.replace('{s}', this._getSubdomain(subdomains, 0, 0));
        }

        return templateURL;
    }

    _getSubdomain(subdomains, x, y) {
        // Reference https://github.com/Leaflet/Leaflet/blob/v1.3.1/src/layer/tile/TileLayer.js#L214-L217
        return subdomains[Math.abs(x + y) % subdomains.length];
    }

    _getVizProperties(viz) {
        const minimunNeededSchema = viz.getMinimumNeededSchema();
        this._checkAcceptableMNS(minimunNeededSchema);
        const resolution = viz.resolution;
        const filtering = windshaftFiltering.getFiltering(viz, { exclusive: this._exclusive });
        this._fixSchema(minimunNeededSchema);

        return { minimunNeededSchema, resolution, filtering };
    }

    // Force to include `cartodb_id` in the MNS columns.
    // TODO: revisit this request to Maps API
    _fixSchema(minimunNeededSchema) {
        if (!minimunNeededSchema.columns.includes('cartodb_id')) {
            minimunNeededSchema.columns.push('cartodb_id');
        }
        return minimunNeededSchema;
    }

    _checkAcceptableMNS(minimunNeededSchema) {
        const aggregatedColumns = {};
        minimunNeededSchema.columns.forEach(column => {
            const basename = schema.column.getBase(column);
            const isAggregated = schema.column.isAggregated(column);
            if (aggregatedColumns[basename] === undefined) {
                aggregatedColumns[basename] = isAggregated;
            } else if (aggregatedColumns[basename] !== isAggregated) {
                throw new Error(`Incompatible combination of cluster aggregation with un-aggregated property: '${basename}'`);
            }
        });
    }

    /**
     * Check if the map needs to be reinstantiated
     * This happens:
     *  - When the minimun required schema changed.
     *  - When the resolution changed.
     *  - When the filter conditions changed and the dataset should be server-filtered.
     */
    _needToInstantiate(MNS, resolution, filtering) {
        return !schema.equals(this._MNS, MNS)
            || resolution != this.resolution
            || (
                JSON.stringify(filtering) != JSON.stringify(this.filtering)
                && this.metadata.featureCount > MIN_FILTERING
            );
    }

    _initialize(auth, config) {
        this._auth = auth || getDefaultAuth();
        this._config = config || getDefaultConfig();
        checkAuth(this._auth);
        checkConfig(this._config);
        this._apiKey = this._auth.apiKey;
        this._username = this._auth.username;
        this._serverURL = this._generateURL(this._auth, this._config);
    }

    _generateURL(auth, config) {
        let url = (config && config.serverURL) || DEFAULT_SERVER_URL_TEMPLATE;
        url = url.replace(/{user}/, auth.username);
        validateServerURL(url);
        return url;
    }
}
