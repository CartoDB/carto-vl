import { version } from '../../package';
import MVT from '../sources/MVT';
import Metadata from './WindshaftMetadata';
import schema from '../renderer/schema';
import * as windshaftFiltering from './windshaft-filtering';
import { CLUSTER_FEATURE_COUNT } from '../renderer/schema';
import CartoValidationError, { CartoValidationTypes as cvt } from '../errors/carto-validation-error';
import CartoMapsAPIError, { CartoMapsAPITypes as cmt } from '../errors/carto-maps-api-error';
import { GEOMETRY_TYPE } from '../utils/geometry';

const SAMPLE_ROWS = 1000;
const MIN_FILTERING = 2000000;
const REQUEST_GET_MAX_URL_LENGTH = 2048;

const TILE_EXTENT = 2048;

export default class Windshaft {
    constructor (source) {
        this._source = source;
        this._exclusive = true;

        this._MNS = null;
        this._promiseMNS = null;
        this.inProgressInstantiations = {};
    }

    bindLayer (addDataframe) {
        this._addDataframe = addDataframe;
        this._mvtClient.bindLayer(addDataframe);
    }

    _getInstantiationID (MNS, resolution, filtering, choices) {
        return JSON.stringify({
            MNS: schema.simplify(MNS),
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
        this._forceIncludeCartodbId(MNS);
        if (this._needToInstantiate(MNS, resolution, filtering)) {
            const instantiationData = await this._repeatableInstantiate(MNS, resolution, filtering);
            this._updateStateAfterInstantiating(instantiationData);
        }
        return this.metadata;
    }

    _forceIncludeCartodbId (MNS) {
        // Force to include `cartodb_id` in the MNS columns.
        // TODO: revisit this request to Maps API
        if (!MNS['cartodb_id']) {
            MNS['cartodb_id'] = [{ type: 'unaggregated' }];
        }
    }

    requiresNewMetadata (viz) {
        const MNS = viz.getMinimumNeededSchema();
        this._checkAcceptableMNS(MNS);
        const resolution = viz.resolution;
        const filtering = windshaftFiltering.getFiltering(viz, { exclusive: this._exclusive });
        this._forceIncludeCartodbId(MNS);
        return this._needToInstantiate(MNS, resolution, filtering);
    }

    _checkAcceptableMNS (MNS) {
        Object.keys(MNS).forEach(propertyName => {
            const usages = MNS[propertyName];
            const aggregatedUsage = usages.some(x => x.type !== 'unaggregated');
            const unAggregatedUsage = usages.some(x => x.type === 'unaggregated');
            if (aggregatedUsage && unAggregatedUsage) {
                throw new CartoValidationError(`${cvt.INCORRECT_VALUE} Incompatible combination of cluster aggregation usages (${
                    JSON.stringify(usages.filter(x => x.type !== 'aggregated'))
                }) with unaggregated usage for property '${propertyName}'`);
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

        let { urlTemplates, metadata } = await this._getInstantiationPromise(query, conf, agg, aggSQL, select, overrideMetadata, MNS);
        metadata.backendFiltersApplied = backendFiltersApplied;

        return { MNS, resolution, filters, metadata, urlTemplates };
    }

    _updateStateAfterInstantiating ({ MNS, resolution, filters, metadata, urlTemplates }) {
        if (this._mvtClient) {
            this._mvtClient.free();
        }
        metadata.extent = TILE_EXTENT;
        this._mvtClient = new MVT(urlTemplates, metadata);
        this._mvtClient._workerName = 'windshaft';
        this._mvtClient.bindLayer(this._addDataframe);
        this.urlTemplates = urlTemplates;
        this.metadata = metadata;
        this._MNS = MNS;
        this.filtering = filters;
        this.resolution = resolution;
        this._checkLayerMeta(MNS);
    }

    async _instantiate (MNS, resolution, filters, choices, metadata) {
        const id = this._getInstantiationID(MNS, resolution, filters, choices);
        if (this.inProgressInstantiations[id]) {
            return this.inProgressInstantiations[id];
        }
        const instantiationPromise = this._instantiateUncached(MNS, resolution, filters, choices, metadata);
        this.inProgressInstantiations[id] = instantiationPromise;
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
                throw new CartoMapsAPIError(`${cmt.NOT_SUPPORTED} Aggregation not supported for this dataset`);
            }
        }
    }

    _isAggregated () {
        return this.metadata && this.metadata.isAggregated;
    }

    _requiresAggregation (MNS) {
        return Object.values(MNS).some(propertyUsages => propertyUsages.some(u => u.type !== 'unaggregated'));
    }

    _generateAggregation (MNS, resolution) {
        let aggregation = {
            columns: {},
            dimensions: {},
            placement: 'centroid',
            resolution: resolution,
            threshold: 1
        };

        Object.keys(MNS)
            .forEach(propertyName => {
                if (propertyName !== 'cartodb_id') {
                    const propertyUsages = MNS[propertyName];
                    propertyUsages.forEach(usage => {
                        if (usage.type === 'aggregated') {
                            aggregation.columns[schema.column.aggColumn(propertyName, usage.op)] = {
                                aggregate_function: usage.op,
                                aggregated_column: propertyName
                            };
                        } else if (usage.type === 'dimension') {
                            const dimension = usage.dimension;
                            const { group, format } = dimension;
                            const parameters = { column: propertyName, group, format };
                            aggregation.dimensions[dimension.propertyName] = parameters;
                        } else {
                            // automatic ungrouped dimension
                            // TODO:
                            // we should consider eliminating this and requiring
                            // all dimensions to be used through clusterXXX functions
                            aggregation.dimensions[propertyName] = {
                                column: propertyName
                            };
                        }
                    });
                }
            });

        return aggregation;
    }

    _buildSelectClause (MNS) {
        const columns = Object.keys(MNS).concat(['the_geom_webmercator', 'cartodb_id']);
        return columns.filter((item, pos) => columns.indexOf(item) === pos); // get unique values
    }

    _buildQuery (select, filters) {
        const columns = select.map(column => `"${column}"`).join();
        const condition = filters ? windshaftFiltering.getSQLWhere(filters) : '';
        return `SELECT ${columns} FROM ${this._source._getFromClause()} ${condition}`;
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

    async _getInstantiationPromise (query, conf, agg, aggSQL, columns, overrideMetadata, MNS) {
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
                        vector_extent: TILE_EXTENT,
                        vector_simplify_extent: TILE_EXTENT,
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
                dimensions: true,
                sample: {
                    num_rows: SAMPLE_ROWS,
                    include_columns: includedColumns // TODO: when supported by Maps API: exclude_columns: excludedColumns
                }
            };
        }
        let response;
        try {
            response = await fetch(getMapRequest(conf, mapConfigAgg));
        } catch (error) {
            throw new CartoMapsAPIError(`Failed to connect to Maps API with your user('${this._source._username}')`);
        }
        const layergroup = await response.json();
        if (!response.ok) {
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
        return {
            urlTemplates: layergroup.metadata.tilejson.vector.tiles,
            metadata: overrideMetadata || this._adaptMetadata(layergroup.metadata.layers[0].meta, agg, MNS)
        };
    }

    _adaptMetadata (meta, agg, MNS) {
        meta.datesAsNumbers = meta.dates_as_numbers;
        const { stats, aggregation, datesAsNumbers } = meta;
        const featureCount = stats.hasOwnProperty('featureCount') ? stats.featureCount : stats.estimatedFeatureCount;
        const geomType = stats.geometryType && adaptGeometryType(stats.geometryType);

        const properties = stats.columns;
        Object.keys(agg.columns).forEach(aggName => {
            const basename = agg.columns[aggName].aggregated_column;
            const fnName = agg.columns[aggName].aggregate_function;
            if (!properties[basename].aggregations) {
                properties[basename].aggregations = {};
            }
            properties[basename].aggregations[fnName] = aggName;
        });
        Object.keys(agg.dimensions).forEach(dimName => {
            const dimension = agg.dimensions[dimName];
            if (stats.dimensions && stats.dimensions[dimName].type) {
                // otherwise, the dimension is a (legacy) ungrouped dimension
                const dimensionStats = stats.dimensions[dimName];
                const dimType = adaptColumnType(dimensionStats.type);
                const { column, ...params } = dimension;
                if (properties[column].dimension) {
                    throw new CartoMapsAPIError(`${cmt.NOT_SUPPORTED} Multiple dimensions based on same column '${column}'.`);
                }
                properties[column].dimension = {
                    propertyName: dimName,
                    grouping: Object.keys(params).length === 0 ? undefined : dimensionStats.params,
                    type: dimType,
                    // TODO: merge all properties of dimensionStats except params, type
                    min: dimensionStats.min,
                    max: dimensionStats.max
                };
                const range = MNS[column].some(c => c.range);
                if (range > 0) {
                    properties[column].dimension.range = ['start', 'end'].map(mode => `${dimName}_${mode}`);
                }
            }
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
            }
        });

        if (geomType === GEOMETRY_TYPE.POINT) {
            properties[CLUSTER_FEATURE_COUNT] = { type: 'number' };
        }

        const idProperty = 'cartodb_id';

        return new Metadata({ properties, featureCount, sample: stats.sample, geomType, isAggregated: aggregation.mvt, idProperty });
    }
}

function adaptGeometryType (type) {
    switch (type) {
        case 'ST_MultiPolygon':
        case 'ST_Polygon':
            return GEOMETRY_TYPE.POLYGON;
        case 'ST_Point':
            return GEOMETRY_TYPE.POINT;
        case 'ST_MultiLineString':
        case 'ST_LineString':
            return GEOMETRY_TYPE.LINE;
        default:
            throw new CartoMapsAPIError(`${cmt.NOT_SUPPORTED} Unimplemented geometry type '${type}'.`);
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
