import { version } from '../../../package';
import Metadata from '../../renderer/Metadata';
import schema from '../../renderer/schema';
import Time from '../../renderer/viz/expressions/time';
import * as windshaftFiltering from './windshaft-filtering';
import sqlHelper from './sqlHelper';


const SAMPLE_ROWS = 1000;
const REQUEST_GET_MAX_URL_LENGTH = 2048;


export default class WindshaftClient {

    /**
     * Manage comunication with CARTO servers.
     * @param {WindshaftSource} source
     */
    constructor(windshaftSource) {
        this._source = windshaftSource;
        this._exclusive = true;

        this._MNS = null;
        this._promiseMNS = null;
        this.inProgressInstantiations = {};
    }

    async instantiateMap(MNS, resolution, filters, choices = { backendFilters: true }, overrideMetadata = null) {
        const conf = this._getConfig(this._source);
        const agg = await this._generateAggregation(MNS, resolution);
        let select = sqlHelper.buildSelectClause(MNS);
        let aggSQL = sqlHelper.buildQuery(select, undefined, this._source);

        const query = `(${aggSQL}) AS tmp`;

        let backendFilters = choices.backendFilters ? filters : null;
        let backendFiltersApplied = false;

        if (backendFilters && this._requiresAggregation(MNS)) {
            agg.filters = windshaftFiltering.getAggregationFilters(backendFilters);
            if (agg.filters) {
                backendFiltersApplied = true;
            }
            if (!this._exclusive) {
                backendFilters = null;
            }
        }
        if (backendFilters) {
            const filteredSQL = sqlHelper.buildQuery(select, backendFilters, this._source);
            backendFiltersApplied = backendFiltersApplied || filteredSQL != aggSQL;
            aggSQL = filteredSQL;
        }

        let { url, metadata, subdomains } = await this._getInstantiationPromise(query, conf, agg, aggSQL, select, overrideMetadata);
        metadata.backendFiltersApplied = backendFiltersApplied;

        this._checkLayerMeta(MNS);
        return { MNS, resolution, filters, metadata, url, subdomains };
    }

    _checkLayerMeta(MNS) {
        if (!this._isAggregated() && this._requiresAggregation(MNS)) {
            throw new Error('Aggregation not supported for this dataset');
        }
    }

    _isAggregated() {
        return this.metadata && this.metadata.isAggregated;
    }

    _requiresAggregation(MNS) {
        return MNS.columns.some(column => schema.column.isAggregated(column));
    }

    _getConfig(source) {
        return {
            apiKey: source._apiKey,
            username: source._username,
            serverURL: source._serverURL
        };
    }

    _generateAggregation(MNS, resolution) {
        let aggregation = {
            columns: {},
            dimensions: {},
            placement: 'centroid',
            resolution: resolution,
            threshold: 1,
        };

        MNS.columns
            .forEach(name => {
                if (name !== 'cartodb_id') {
                    if (schema.column.isAggregated(name)) {
                        aggregation.columns[name] = {
                            aggregate_function: schema.column.getAggFN(name),
                            aggregated_column: schema.column.getBase(name)
                        };
                    } else {
                        aggregation.dimensions[name] = name;
                    }
                }
            });

        return aggregation;
    }

    async _getInstantiationPromise(query, conf, agg, aggSQL, columns, overrideMetadata = null) {
        const LAYER_INDEX = 0;
        const mapConfigAgg = {
            buffersize: {
                mvt: 1
            },
            layers: [
                {
                    type: 'mapnik',
                    options: {
                        sql: aggSQL,
                        aggregation: agg,
                        dates_as_numbers: true
                    }
                }
            ]
        };
        if (!overrideMetadata) {
            const excludedColumns = ['the_geom', 'the_geom_webmercator'];
            const includedColumns = columns.filter(name => !excludedColumns.includes(name));
            mapConfigAgg.layers[0].options.metadata = {
                geometryType: true,
                columnStats: { topCategories: 32768, includeNulls: true },
                sample: {
                    num_rows: SAMPLE_ROWS,
                    include_columns: includedColumns // TODO: when supported by Maps API: exclude_columns: excludedColumns
                }
            };
        }
        const response = await fetch(getMapRequest(conf, mapConfigAgg));
        const layergroup = await response.json();
        if (!response.ok) {
            throw new Error(`Maps API error: ${JSON.stringify(layergroup)}`);
        }
        const subdomains = layergroup.cdn_url ? layergroup.cdn_url.templates.https.subdomains : [];
        return {
            url: getLayerUrl(layergroup, LAYER_INDEX, conf),
            metadata: overrideMetadata || this._adaptMetadata(layergroup.metadata.layers[0].meta, agg),
            subdomains
        };
    }

    _getRequestConfig(mapConfigAgg) {
        return {
            method: 'POST',
            headers: {

                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mapConfigAgg),
        };
    }

    _adaptMetadata(meta, agg) {
        const { stats, aggregation, dates_as_numbers } = meta;
        const featureCount = stats.hasOwnProperty('featureCount') ? stats.featureCount : stats.estimatedFeatureCount;
        const geomType = adaptGeometryType(stats.geometryType);

        const properties = stats.columns;
        Object.keys(agg.columns).forEach(aggName => {
            const basename = schema.column.getBase(aggName);
            const fnName = schema.column.getAggFN(aggName);
            if (!properties[basename].aggregations) {
                properties[basename].aggregations = {};
            }
            properties[basename].aggregations[fnName] = aggName;
        });
        Object.values(properties).map(property => {
            property.type = adaptColumnType(property.type);
        });

        Object.keys(properties).forEach(propertyName => {
            const property = properties[propertyName];
            if (property.type === 'category' && property.categories) {
                property.categories.forEach(category => {
                    category.name = category.category;
                    delete category.category;
                });
            } else if (dates_as_numbers && dates_as_numbers.includes(propertyName)) {
                property.type = 'date';
                ['min', 'max', 'avg'].map(fn => {
                    if (property[fn]) {
                        property[fn] = new Time(property[fn] * 1000).value;
                    }
                });
            }
        });

        const metadata = new Metadata({ properties, featureCount, sample: stats.sample, geomType, isAggregated: aggregation.mvt });
        return metadata;
    }
}


function adaptGeometryType(type) {
    switch (type) {
        case 'ST_MultiPolygon':
        case 'ST_Polygon':
            return 'polygon';
        case 'ST_Point':
            return 'point';
        case 'ST_MultiLineString':
        case 'ST_LineString':
            return 'line';
        default:
            throw new Error(`Unimplemented geometry type ''${type}'`);
    }
}

function adaptColumnType(type) {
    if (type === 'string') {
        return 'category';
    }
    return type;
}

function getMapRequest(conf, mapConfig) {
    const mapConfigPayload = JSON.stringify(mapConfig);
    const auth = encodeParameter('api_key', conf.apiKey);
    const client = encodeParameter('client', `vl-${version}`);

    const parameters = [auth, client, encodeParameter('config', mapConfigPayload)];
    const url = generateUrl(generateMapsApiUrl(conf), parameters);
    if (url.length < REQUEST_GET_MAX_URL_LENGTH) {
        return new Request(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return new Request(generateUrl(generateMapsApiUrl(conf), [auth, client]), {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: mapConfigPayload
    });
}

function getLayerUrl(layergroup, layerIndex, conf) {
    const params = [encodeParameter('api_key', conf.apiKey)];
    if (layergroup.cdn_url && layergroup.cdn_url.templates) {
        const urlTemplates = layergroup.cdn_url.templates.https;
        return generateUrl(`${urlTemplates.url}/${conf.username}/api/v1/map/${layergroup.layergroupid}/${layerIndex}/{z}/{x}/{y}.mvt`, params);
    }
    return generateUrl(generateMapsApiUrl(conf, `/${layergroup.layergroupid}/${layerIndex}/{z}/{x}/{y}.mvt`), params);
}

function encodeParameter(name, value) {
    return `${name}=${encodeURIComponent(value)}`;
}

function generateUrl(url, parameters = []) {
    return `${url}?${parameters.join('&')}`;
}

function generateMapsApiUrl(conf, path) {
    let url = `${conf.serverURL}/api/v1/map`;
    if (path) {
        url += path;
    }
    return url;
}
