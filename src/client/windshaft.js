
import MVT from '../sources/MVT';
import Metadata from './WindshaftMetadata';
import { DEFAULT_ID_PROPERTY } from '../renderer/Metadata';
import schema from '../renderer/schema';
import * as windshaftFiltering from './windshaft-filtering';
import WindshaftRequestHelper from './WindshaftRequestHelper';

import CartoValidationError, { CartoValidationErrorTypes } from '../errors/carto-validation-error';
import CartoMapsAPIError, { CartoMapsAPIErrorTypes } from '../errors/carto-maps-api-error';
import { GEOMETRY_TYPE } from '../utils/geometry';
import { CLUSTER_FEATURE_COUNT, aggregationTypes } from '../constants/metadata';

const SAMPLE_ROWS = 1000;
const MIN_FILTERING = 2000000;
const MAX_CATEGORIES = 32768;
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

    _getInstantiationID (vizInfo, choices) {
        const { MNS, resolution, filtering } = vizInfo;

        return JSON.stringify({
            MNS: schema.simplify(MNS),
            resolution,
            filtering: choices.backendFilters ? filtering : null,
            options: choices
        });
    }

    /**
     * Should be called whenever the viz changes, even if metadata is not going to be used.
     * This not only computes metadata: it also updates the map (instantiates) for the new viz if needed
     * Returns  a promise to a Metadata
     * @param {*} viz
     */
    async getMetadata (viz) {
        const vizInfo = this._getServerInfoFrom(viz);

        if (this._needToInstantiateMap(vizInfo)) {
            const instantiationData = await this._repeatableInstantiate(vizInfo);
            this._updateStateAfterInstantiating(instantiationData);
        }

        return this.metadata;
    }

    /**
     * Get relevant info from Viz related to windshaft requests
     */
    _getServerInfoFrom (viz) {
        const MNS = this._getMinNeededSchemaFrom(viz);
        const resolution = viz.resolution.value;
        const filtering = windshaftFiltering.getFiltering(viz, { exclusive: this._exclusive });

        // TODO: properly document returned output at jsdoc (with typedef?)
        const vizInfo = { MNS, resolution, filtering }; // TODO this looks like a Type or even a Class
        return vizInfo;
    }

    /**
     * Get the minimum schema from the viz, validated and with DEFAULT_ID_PROPERTY
    */
    _getMinNeededSchemaFrom (viz) {
        const MNS = viz.getMinimumNeededSchema();
        this._checkAcceptableMNS(MNS);
        this._forceIncludeCartodbId(MNS);

        return MNS;
    }

    _forceIncludeCartodbId (MNS) {
        // Force to include DEFAULT_ID_PROPERTY in the MNS columns.
        // TODO: revisit this request to Maps API
        if (!MNS[DEFAULT_ID_PROPERTY]) {
            MNS[DEFAULT_ID_PROPERTY] = [{ type: aggregationTypes.UNAGGREGATED }];
        }
    }

    requiresNewMetadata (viz) {
        const vizInfo = this._getServerInfoFrom(viz);
        return this._needToInstantiateMap(vizInfo);
    }

    _checkAcceptableMNS (MNS) {
        Object.keys(MNS).forEach(propertyName => {
            const usages = MNS[propertyName];
            const aggregatedUsage = usages.some(x => x.type === aggregationTypes.AGGREGATED);
            const unAggregatedUsage = usages.some(x => x.type === aggregationTypes.UNAGGREGATED);
            if (aggregatedUsage && unAggregatedUsage) {
                const aggregationUssages = JSON.stringify(usages.filter(x => x.type !== 'aggregated'));
                throw new CartoValidationError(
                    `Incompatible combination of cluster aggregation usages (${aggregationUssages}) with unaggregated usage for property '${propertyName}'`,
                    CartoValidationErrorTypes.INCORRECT_VALUE
                );
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
    _needToInstantiateMap (vizInfo) {
        const { MNS, resolution, filtering } = vizInfo;

        const schemaChanged = schema.notEquals(this._MNS, MNS);
        const resolutionChanged = this.resolution !== resolution;
        const filteringChanged = JSON.stringify(this.filtering) !== JSON.stringify(filtering);
        const shouldBeServerFiltered = this.metadata && (this.metadata.featureCount > MIN_FILTERING);

        return schemaChanged || resolutionChanged || (filteringChanged && shouldBeServerFiltered);
    }

    _isInstantiated () {
        return !!this.metadata;
    }

    _instantiationChoices (metadata) {
        let choices = {
            backendFilters: true // default choices
        };

        const thereAreFeatures = metadata && metadata.featureCount >= 0;
        if (thereAreFeatures) {
            const shouldBeServerFiltered = metadata.featureCount > MIN_FILTERING;
            choices.backendFilters = shouldBeServerFiltered || !metadata.backendFiltersApplied;
        }

        return choices;
    }

    async _instantiateUncached (vizInfo, choices = { backendFilters: true }, overrideMetadata = null) {
        const { MNS, resolution, filtering } = vizInfo;

        const agg = await this._generateAggregation(MNS, resolution);
        let select = this._buildSelectClause(MNS);
        let aggSQL = this._buildQuery(select);

        const query = `(${aggSQL}) AS tmp`;

        let backendFilters = choices.backendFilters ? filtering : null;
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

        const conf = this._getConfig();
        let { urlTemplates, metadata } = await this._getInstantiationPromise(query, conf, agg, aggSQL, select, overrideMetadata, MNS);
        metadata.backendFiltersApplied = backendFiltersApplied;

        return { MNS, resolution, filtering, metadata, urlTemplates };
    }

    _updateStateAfterInstantiating ({ MNS, resolution, filtering, metadata, urlTemplates }) {
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
        this.filtering = filtering;
        this.resolution = resolution;
        this._checkLayerMeta(MNS);
    }

    async _instantiate (vizInfo, choices, metadata) {
        const id = this._getInstantiationID(vizInfo, choices);
        if (this.inProgressInstantiations[id]) {
            return this.inProgressInstantiations[id];
        }

        const instantiationPromise = this._instantiateUncached(vizInfo, choices, metadata);
        this.inProgressInstantiations[id] = instantiationPromise;
        return instantiationPromise;
    }

    async _repeatableInstantiate (vizInfo) {
        // TODO: we shouldn't reinstantiate just to not apply backend filters
        // (we'd need to add a choice comparison function argument to repeatablePromise)
        let finalMetadata = null;
        const initialChoices = this._instantiationChoices(this.metadata);
        const finalChoices = instantiation => {
            // first instantiation metadata is kept
            finalMetadata = instantiation.metadata;
            return this._instantiationChoices(instantiation.metadata);
        };

        return repeatablePromise(initialChoices, finalChoices, choices => this._instantiate(vizInfo, choices, finalMetadata));
    }

    _checkLayerMeta (MNS) {
        if (!this._isAggregated() && this._requiresAggregation(MNS)) {
            throw new CartoMapsAPIError('Aggregation not supported for this dataset', CartoMapsAPIErrorTypes.NOT_SUPPORTED);
        }
    }

    _isAggregated () {
        return this.metadata && this.metadata.isAggregated;
    }

    _requiresAggregation (MNS) {
        return Object.values(MNS).some(propertyUsages =>
            propertyUsages.some(u => u.type === aggregationTypes.AGGREGATED)
        );
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
                if (propertyName !== DEFAULT_ID_PROPERTY) {
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
        const columns = Object.keys(MNS).concat(['the_geom_webmercator', DEFAULT_ID_PROPERTY]);
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
        const mapConfigAgg = this._getMapConfigAgg(agg, aggSQL);
        if (!overrideMetadata) {
            this._completeMapConfigWithColumns(mapConfigAgg, columns);
        }

        const layergroup = await this._getLayerGroupFromWindshaft(conf, mapConfigAgg);

        return {
            urlTemplates: layergroup.metadata.tilejson.vector.tiles,
            metadata: overrideMetadata || this._adaptMetadata(layergroup.metadata.layers[0].meta, agg, MNS)
        };
    }

    _getMapConfigAgg (agg, aggSQL) {
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
        return mapConfigAgg;
    }

    _completeMapConfigWithColumns (mapConfigAgg, columns) {
        const excludedColumns = ['the_geom', 'the_geom_webmercator'];
        const includedColumns = columns.filter(name => !excludedColumns.includes(name));
        mapConfigAgg.layers[0].options.metadata = {
            geometryType: true,
            columnStats: {
                topCategories: MAX_CATEGORIES,
                includeNulls: true
            },
            dimensions: true,
            sample: {
                num_rows: SAMPLE_ROWS,
                include_columns: includedColumns // TODO: when supported by Maps API: exclude_columns: excludedColumns
            }
        };
    }

    async _getLayerGroupFromWindshaft (conf, mapConfigAgg) {
        const requestHelper = new WindshaftRequestHelper(conf, mapConfigAgg);
        return requestHelper.getLayerGroup();
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

            if (basename !== aggName) {
                properties[aggName] = JSON.parse(JSON.stringify(properties[basename]));
            }
        });

        Object.keys(agg.dimensions).forEach(dimName => {
            const dimension = agg.dimensions[dimName];
            if (stats.dimensions && stats.dimensions[dimName].type) {
                // otherwise, the dimension is a (legacy) ungrouped dimension
                const dimensionStats = stats.dimensions[dimName];
                const dimType = adaptColumnType(dimensionStats.type);
                const { column, ...params } = dimension;
                if (properties[column].dimension) {
                    throw new CartoMapsAPIError(`Multiple dimensions based on same column '${column}'.`, CartoMapsAPIErrorTypes.NOT_SUPPORTED);
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

        return new Metadata({
            properties,
            featureCount,
            sample: stats.sample,
            geomType,
            isAggregated: aggregation.mvt,
            idProperty: DEFAULT_ID_PROPERTY
        });
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
            throw new CartoMapsAPIError(`Unimplemented geometry type '${type}'.`, CartoMapsAPIErrorTypes.NOT_SUPPORTED);
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
