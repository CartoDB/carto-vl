import { version } from '../../package';
import MVT from '../sources/MVT';
import Metadata from '../renderer/Metadata';
import schema from '../renderer/schema';
import Time from '../renderer/viz/expressions/time';
import * as windshaftFiltering from './windshaft-filtering';

const SAMPLE_ROWS = 1000;
const MIN_FILTERING = 2000000;
const REQUEST_GET_MAX_URL_LENGTH = 2048;

// Get dataframes <- MVT <- Windshaft
// Get metadata
// Instantiate map Windshaft
// Requrest SQL API (temp)
// Cache dataframe

export default class Windshaft {
    constructor (source) {
        this._source = source;
        this._exclusive = true;

        this._MNS = null;
        this._promiseMNS = null;
        this.inProgressInstantiations = {};
    }

    bindLayer (addDataframe, dataLoadedCallback) {
        this._addDataframe = addDataframe;
        this._dataLoadedCallback = dataLoadedCallback;
        this._mvtClient.bindLayer(addDataframe, dataLoadedCallback);
    }

    _getInstantiationID (MNS, resolution, filtering, choices) {
        return JSON.stringify({
            MNS,
            resolution,
            filtering: choices.backendFilters ? filtering : null,
            options: choices
        });
    }

    /**
     * Should be called whenever the viz changes (even if metadata is not going to be used)
     * This not only computes metadata: it also updates the map (instantiates) for the new viz if needed
     * Returns  a promise to a Metadata
     * @param {*} viz
     */
    async getMetadata (viz) {
        const MNS = viz.getMinimumNeededSchema();
        this._checkAcceptableMNS(MNS);
        const resolution = viz.resolution;
        const filtering = windshaftFiltering.getFiltering(viz, { exclusive: this._exclusive });
        // Force to include `cartodb_id` in the MNS columns.
        // TODO: revisit this request to Maps API
        if (!MNS.columns.includes('cartodb_id')) {
            MNS.columns.push('cartodb_id');
        }
        if (this._needToInstantiate(MNS, resolution, filtering)) {
            const instantiationData = await this._repeatableInstantiate(MNS, resolution, filtering);
            this._updateStateAfterInstantiating(instantiationData);
        }
        return this.metadata;
    }

    requiresNewMetadata (viz) {
        const MNS = viz.getMinimumNeededSchema();
        this._checkAcceptableMNS(MNS);
        const resolution = viz.resolution;
        const filtering = windshaftFiltering.getFiltering(viz, { exclusive: this._exclusive });
        if (!MNS.columns.includes('cartodb_id')) {
            MNS.columns.push('cartodb_id');
        }
        return this._needToInstantiate(MNS, resolution, filtering);
    }

    _checkAcceptableMNS (MNS) {
        const columnAgg = {};
        MNS.columns.map(column => {
            const basename = schema.column.getBase(column);
            const isAgg = schema.column.isAggregated(column);
            if (columnAgg[basename] === undefined) {
                columnAgg[basename] = isAgg;
            } else if (columnAgg[basename] !== isAgg) {
                throw new Error(`Incompatible combination of cluster aggregation with un-aggregated property: '${basename}'`);
            }
        });
    }

    /**
     * After calling getMetadata(), data for a viewport can be obtained with this function.
     * So long as the viz doesn't change, getData() can be called repeatedly for different
     * viewports. If viz changes getMetadata() should be called before requesting data
     * for the new viz.
     */
    getData (zoom, viewport) {
        if (this._mvtClient) {
            return this._mvtClient.requestData(zoom, viewport);// FIXME extend
        }
    }

    /**
     * Check if the map needs to be reinstantiated
     * This happens:
     *  - When the minimun required schema changed.
     *  - When the resolution changed.
     *  - When the filter conditions changed and the dataset should be server-filtered.
     */
    _needToInstantiate (MNS, resolution, filtering) {
        return !schema.equals(this._MNS, MNS) ||
            resolution !== this.resolution ||
            (
                JSON.stringify(filtering) !== JSON.stringify(this.filtering) &&
                this.metadata.featureCount > MIN_FILTERING
            );
    }

    _isInstantiated () {
        return !!this.metadata;
    }

    _intantiationChoices (metadata) {
        let choices = {
            // default choices
            backendFilters: true
        };
        if (metadata) {
            if (metadata.featureCount >= 0) {
                choices.backendFilters = metadata.featureCount > MIN_FILTERING || !metadata.backendFiltersApplied;
            }
        }
        return choices;
    }

    async _instantiateUncached (MNS, resolution, filters, choices = { backendFilters: true }, overrideMetadata = null) {
        const conf = this._getConfig();
        const agg = await this._generateAggregation(MNS, resolution);
        let select = this._buildSelectClause(MNS);
        let aggSQL = this._buildQuery(select);

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
            const filteredSQL = this._buildQuery(select, backendFilters);
            backendFiltersApplied = backendFiltersApplied || filteredSQL !== aggSQL;
            aggSQL = filteredSQL;
        }

        let { url, metadata } = await this._getInstantiationPromise(query, conf, agg, aggSQL, select, overrideMetadata);
        metadata.backendFiltersApplied = backendFiltersApplied;

        return { MNS, resolution, filters, metadata, urlTemplate: url };
    }

    _updateStateAfterInstantiating ({ MNS, resolution, filters, metadata, urlTemplate }) {
        if (this._mvtClient) {
            this._mvtClient.free();
        }
        this._mvtClient = new MVT(this._URLTemplates);
        this._mvtClient.bindLayer(this._addDataframe, this._dataLoadedCallback);
        this._mvtClient.decodeProperty = (propertyName, propertyValue) => {
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
        this.urlTemplate = urlTemplate;
        this.metadata = metadata;
        this._mvtClient._metadata = metadata;
        this._MNS = MNS;
        this.filtering = filters;
        this.resolution = resolution;
        this._checkLayerMeta(MNS);
    }
    async _instantiate (MNS, resolution, filters, choices, metadata) {
        if (this.inProgressInstantiations[this._getInstantiationID(MNS, resolution, filters, choices)]) {
            return this.inProgressInstantiations[this._getInstantiationID(MNS, resolution, filters, choices)];
        }
        const instantiationPromise = this._instantiateUncached(MNS, resolution, filters, choices, metadata);
        this.inProgressInstantiations[this._getInstantiationID(MNS, resolution, filters, choices)] = instantiationPromise;
        return instantiationPromise;
    }

    async _repeatableInstantiate (MNS, resolution, filters) {
        // TODO: we shouldn't reinstantiate just to not apply backend filters
        // (we'd need to add a choice comparison function argument to repeatablePromise)
        let finalMetadata = null;
        const initialChoices = this._intantiationChoices(this.metadata);
        const finalChoices = instantiation => {
            // first instantiation metadata is kept
            finalMetadata = instantiation.metadata;
            return this._intantiationChoices(instantiation.metadata);
        };
        return repeatablePromise(initialChoices, finalChoices, choices => this._instantiate(MNS, resolution, filters, choices, finalMetadata));
    }

    _checkLayerMeta (MNS) {
        if (!this._isAggregated()) {
            if (this._requiresAggregation(MNS)) {
                throw new Error('Aggregation not supported for this dataset');
            }
        }
    }

    _isAggregated () {
        return this.metadata && this.metadata.isAggregated;
    }

    _requiresAggregation (MNS) {
        return MNS.columns.some(column => schema.column.isAggregated(column));
    }

    _generateAggregation (MNS, resolution) {
        let aggregation = {
            columns: {},
            dimensions: {},
            placement: 'centroid',
            resolution: resolution,
            threshold: 1
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

    _buildSelectClause (MNS) {
        const columns = MNS.columns.map(name => schema.column.getBase(name))
            .concat(['the_geom', 'the_geom_webmercator', 'cartodb_id']);
        return columns.filter((item, pos) => columns.indexOf(item) === pos); // get unique values
    }

    _buildQuery (select, filters) {
        const columns = select.join();
        const relation = this._source._query ? `(${this._source._query}) as _cdb_query_wrapper` : this._source._tableName;
        const condition = filters ? windshaftFiltering.getSQLWhere(filters) : '';
        return `SELECT ${columns} FROM ${relation} ${condition}`;
    }

    _getConfig () {
        return {
            apiKey: this._source._apiKey,
            username: this._source._username,
            serverURL: this._source._serverURL
        };
    }

    free () {
        if (this._mvtClient) {
            this._mvtClient.free();
        }
    }

    async _getInstantiationPromise (query, conf, agg, aggSQL, columns, overrideMetadata = null) {
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
        this._URLTemplates = layergroup.metadata.tilejson.vector.tiles;
        return {
            url: getLayerUrl(layergroup, LAYER_INDEX, conf),
            metadata: overrideMetadata || this._adaptMetadata(layergroup.metadata.layers[0].meta, agg)
        };
    }

    _adaptMetadata (meta, agg) {
        meta.datesAsNumbers = meta.dates_as_numbers;
        const { stats, aggregation, datesAsNumbers } = meta;
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
            } else if (datesAsNumbers && datesAsNumbers.includes(propertyName)) {
                property.type = 'date';
                ['min', 'max', 'avg'].map(fn => {
                    if (property[fn]) {
                        property[fn] = new Time(property[fn] * 1000).value;
                    }
                });
            } else if (property.type === 'geometry') {
                delete properties[propertyName];
            }
        });

        const idProperty = 'cartodb_id';

        const metadata = new Metadata({ properties, featureCount, sample: stats.sample, geomType, isAggregated: aggregation.mvt, idProperty });
        return metadata;
    }
}

function adaptGeometryType (type) {
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

function adaptColumnType (type) {
    if (type === 'string') {
        return 'category';
    }
    return type;
}

// generate a promise under certain assumptions/choices; then if the result changes the assumptions,
// repeat the generation with the new information
async function repeatablePromise (initialAssumptions, assumptionsFromResult, promiseGenerator) {
    let promise = promiseGenerator(initialAssumptions);
    let result = await promise;
    let finalAssumptions = assumptionsFromResult(result);
    if (JSON.stringify(initialAssumptions) === JSON.stringify(finalAssumptions)) {
        return promise;
    } else {
        return promiseGenerator(finalAssumptions);
    }
}

function getMapRequest (conf, mapConfig) {
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

function getLayerUrl (layergroup, layerIndex, conf) {
    const params = [encodeParameter('api_key', conf.apiKey)];
    if (layergroup.cdn_url && layergroup.cdn_url.templates) {
        const urlTemplates = layergroup.cdn_url.templates.https;
        return generateUrl(`${urlTemplates.url}/${conf.username}/api/v1/map/${layergroup.layergroupid}/${layerIndex}/{z}/{x}/{y}.mvt`, params);
    }
    return generateUrl(generateMapsApiUrl(conf, `/${layergroup.layergroupid}/${layerIndex}/{z}/{x}/{y}.mvt`), params);
}

function encodeParameter (name, value) {
    return `${name}=${encodeURIComponent(value)}`;
}

function generateUrl (url, parameters = []) {
    return `${url}?${parameters.join('&')}`;
}

function generateMapsApiUrl (conf, path) {
    let url = `${conf.serverURL}/api/v1/map`;
    if (path) {
        url += path;
    }
    return url;
}
