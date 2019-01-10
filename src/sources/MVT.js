
import Dataframe from '../renderer/Dataframe';
import Metadata from '../renderer/Metadata';
import MVTMetadata from './MVTMetadata';
import Base from './Base';
import TileClient from './TileClient';
import Worker from './MVTWorkers.worker';

export default class MVT extends Base {
    /**
     * Create a carto.source.MVT.
     *
     * @param {string | string[]} templateURL - A string with the URL template of the MVT tiles in https://mytileserver.com/{z}/{x}/{y}.mvt format or a list of such templates. Usage of a list of templates with different domains is recommended since that allows the browser to make more requests in parallel.
     * @param {MVTMetadata} [metadata] - Metadata of the source, declaring property name, types and optionally ranges.
     * @param {MVTOptions} [options] - MVT source configuration, the default value will be valid for regular URL templates if the tiles are composed of only one layer
     *
     * The combination of different type of geometries on the same source is not supported. Valid geometry types are `points`, `lines` and `polygons`.
     *
     * @example
     * // Usage with multiple templateURLs as recommended
     * const metadata = new carto.source.mvt.Metadata([{ type: 'number', name: 'total_pop'}])
     * const source = new carto.source.MVT(
     *     [
     *         "https://server-a.tileserver.com/{z}/{x}/{y}.mvt",
     *         "https://server-b.tileserver.com/{z}/{x}/{y}.mvt",
     *         "https://server-c.tileserver.com/{z}/{x}/{y}.mvt",
     *         "https://server-d.tileserver.com/{z}/{x}/{y}.mvt"
     *    ],
     *    metadata
     *);
     *
     * @throws CartoError
     *
     * @memberof carto.source
     * @name MVT
     * @api
     */
    constructor (templateURL, metadata = new MVTMetadata(), options = { layerID: undefined, viewportZoomToSourceZoom: Math.ceil, maxZoom: undefined }) {
        super();
        this._templateURL = templateURL;
        if (!(metadata instanceof Metadata)) {
            metadata = new MVTMetadata(metadata);
        }
        this._metadata = metadata;
        this._metadata.setCodecs();
        this._tileClient = new TileClient(templateURL);
        this._options = options;
        this._options.viewportZoomToSourceZoom = this._options.viewportZoomToSourceZoom || Math.ceil;

        this._workerDispatch = {};
        this._mID = 0;
        this._workerName = 'MVT';
    }

    get _worker () {
        if (!this._workerInstance) {
            this._workerInstance = new Worker();
            this._workerInstance.onmessage = event => {
                const mID = event.data.mID;
                const dataframe = event.data.dataframe;
                const metadata = dataframe.metadata;
                if (!dataframe.empty) {
                    Object.setPrototypeOf(dataframe, Dataframe.prototype);
                    this._metadata.numCategories = metadata.numCategories;
                    this._metadata.categoryToID = metadata.categoryToID;
                    this._metadata.IDToCategory = metadata.IDToCategory;
                    this._metadata.geomType = metadata.geomType;
                    dataframe.metadata = this._metadata;
                }
                this._workerDispatch[mID](dataframe);
            };
        }
        return this._workerInstance;
    }

    _clone () {
        return new MVT(this._templateURL, JSON.parse(JSON.stringify(this._metadata)), this._options);
    }

    bindLayer (addDataframe) {
        this._tileClient.bindLayer(addDataframe);
    }

    async requestMetadata () {
        return this._metadata;
    }

    requestData (zoom, viewport) {
        return this._tileClient.requestData(zoom, viewport, (x, y, z, url) => {
            return new Promise(resolve => {
                // Relative URLs don't work inside the Web Worker
                if (url[0] === '.') {
                    let parts = window.location.pathname.split('/');
                    parts.pop();
                    const path = parts.join('/');
                    url = `${window.location.protocol}//${window.location.host}/${path}/${url}`;
                } else if (url[0] === '/') {
                    url = `${window.location.protocol}//${window.location.host}${url}`;
                }
                this._worker.postMessage({
                    x,
                    y,
                    z,
                    url,
                    layerID: this._options.layerID,
                    metadata: this._metadataSent ? undefined : this._metadata,
                    mID: this._mID,
                    workerName: this._workerName
                });
                this._metadataSent = true;
                this._workerDispatch[this._mID] = resolve;
                this._mID++;
            });
        },
        zoom => this._options.maxZoom === undefined
            ? this._options.viewportZoomToSourceZoom(zoom)
            : Math.min(this._options.viewportZoomToSourceZoom(zoom), this._options.maxZoom)
        );
    }

    free () {
        this._tileClient.free();
    }
}

/**
 * A MVTOptions object declares a MVT configuration
 *
 * @typedef {Object} MVTOptions
 * @property {String} layerID - layerID on the MVT tiles to decode, the parameter is optional if the MVT tiles only contain one layer
 * @property {function} [viewportZoomToSourceZoom=Math.ceil] - function to transform the viewport zoom into a zoom value to replace `{z}` in the MVT URL template, undefined defaults to `Math.ceil`
 * @property {number} maxZoom - limit MVT tile requests to this zoom level, undefined defaults to no limit
 *
 * @example <caption>Use layer `myAwesomeLayer` and request tiles up to zoom level 12.</caption>
 * const options = {
 *     layerID: 'myAwesomeLayer',
 *     maxZoom: 12
 * };
 *
 * @example <caption>Use layer `myAwesomeLayer` and request tiles only at zoom levels 4, 5 and 6.</caption>
 * const options = {
 *     layerID: 'myAwesomeLayer',
 *     viewportZoomToSourceZoom: zoom => Math.min(Math.max(Math.ceil(zoom), 4), 6)
 * };
 *
 * @example <caption>Use layer `myAwesomeLayer` and request tiles only at zoom levels 0,3,6,9...</caption>
 * const options = {
 *     layerID: 'myAwesomeLayer',
 *     viewportZoomToSourceZoom: zoom => Math.round(zoom / 3) * 3
 * };
 *
 * @api
 */

/**
 * An MVTMetadata object declares metadata information of a a carto.Source.
 *
 * @typedef {Object} MVTMetadata
 * @property {MVTProperty} properties - property names, types and optionally ranges
 * @property {String} [idProperty='cartodb_id'] - property name of the property that should be used as ID
 *
 * @example <caption> Creating a MVTMetadata object</caption>
 * const metadata = {
        properties: {
          numfloors: { type: 'number' },
          cartodb_id: { type: 'number' }
        },
        idProperty: 'cartodb_id',
      };
 *
 * @api
 */

/**
 * MVTProperty objects declare a property type and, optionally, additional information like numeric ranges.
 *
 * @typedef {Object} MVTProperty
 * @property {String} type - Valid values are 'number' and 'category', 'category' must be used if the MVT encodes the property as strings, regardless of the real type
 * @property {Number} min - With `type='number'` min specifies the minimum value in the dataset, this is used in global aggregation expressions
 * @property {Number} max - With `type='number'` max specifies the maximum value in the dataset, this is used in global aggregation expressions
 *
 * @api
 */
