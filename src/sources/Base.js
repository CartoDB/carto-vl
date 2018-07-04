export default class Base {

    /**
     * Base data source object.
     *
     * The methods listed in the {@link carto.source.Base} object are available in all source objects.
     *
     * Use a source to reference the data used in a {@link carto.layer.Base|layer}.
     *
     * {@link carto.source.Base} should not be used directly use {@link carto.source.Dataset}, {@link carto.source.SQL} of {@link carto.source.GeoJSON} instead.
     *
     *
     * @memberof carto.source
     * @constructor Base
     * @abstract
     * @api
     */
    constructor() {
    }

    /**
     * Connects a source with a layer setting callbacks
     * @abstract
     */
    bindLayer() {

    }

    /**
     * Get the metadata for the source
     * @abstract
     */
    requestMetadata() {

    }

    /**
     * Get the data, generates dataframes and call dataLoaded when complete
     * @abstract
     */
    requestData() {

    }

    /**
     * Check if the availiable metadata is suitable for the given Viz
     * @abstract
     */
    requiresNewMetadata() {

    }

    /**
     * Removes all dataframes and clears caches
     * @abstract
     */
    free() {

    }

    /**
     * Creates a new equal source
     * @abstract
     */
    clone() {

    }
}
