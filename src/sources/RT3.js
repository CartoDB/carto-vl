import Dataframe from '../renderer/Dataframe';
import Metadata from '../renderer/Metadata';
import Base from './Base';

import RT3Consumer from 'rt3-consumer';

const DATAFRAME_MAX_FEATURES = 100 * 1024;

export default class RT3 extends Base {
    /**
     * Create a carto.source.GeoJSON source from a GeoJSON object.
     *
     * @param {object} data - A GeoJSON data object
     * @param {object} options - Options
     * @param {array<string>} options.dateColumns - List of columns that contain dates.
     *
     * The combination of different type of geometries on the same source is not supported. Valid geometry types are `Point`, `LineString`, `MultiLineString`, `Polygon` and `MultiPolygon`.
     *
     * @example
     * const source = new carto.source.GeoJSON({
     *   "type": "Feature",
     *   "geometry": {
     *     "type": "Point",
     *     "coordinates": [ 0, 0 ]
     *   },
     *   "properties": {
     *     "index": 1
     *   }
     * });
     *
     * @fires CartoError
     *
     * @constructor GeoJSON
     * @extends carto.source.Base
     * @memberof carto.source
     * @api
     */
    constructor (URL) {
        super();
        this._URL = URL;
    }

    bindLayer (addDataframe, dataLoadedCallback) {
        this._addDataframe = addDataframe;
        this._dataLoadedCallback = dataLoadedCallback;
    }

    async requestMetadata (viz) {
        if (!this._rt3Client) {
            this._rt3Client = new RT3Consumer(this._URL, {});
            const r3tMetadata = await this._rt3Client.getMetadata();

            this._metadata = new Metadata({
                properties: r3tMetadata.properties,
                featureCount: Number.NaN,
                idProperty: 'id'
            });
        }
        return this._metadata;
    }

    requestData () {
        if (!this._dataframes && this._metadata) {
            const properties = {};
            Object.keys(this._metadata.properties).forEach(propertyName => {
                properties[propertyName] = new Float32Array(DATAFRAME_MAX_FEATURES);
            });
            this._center = { x: 0, y: 0 };
            const dataframe = new Dataframe({
                active: true,
                center: this._center,
                geom: (new Float32Array(DATAFRAME_MAX_FEATURES * 6)).fill(1000),
                properties: properties,
                scale: 1,
                size: DATAFRAME_MAX_FEATURES,
                type: 'point',
                metadata: this._metadata
            });
            this.features = 0;
            this._dataframes = [dataframe];

            this._addDataframe(dataframe);

            this._rt3Client.setCallbacks({
                onSet: point => {
                    dataframe.addPoint({ lat: point.lat, lng: point.lon }, point.data, point.id);
                    this._dataLoadedCallback();
                },
                onDelete: point => {
                    dataframe.removePoint(point.id);
                    this._dataLoadedCallback();
                }
            });

            this._dataLoadedCallback();
        }
    }

    requiresNewMetadata () {
        return false;
    }

    _clone () {
        return new RT3(this._URL);
    }

    free () {
    }
}
