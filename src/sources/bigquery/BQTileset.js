
import Dataframe from '../../renderer/dataframe/Dataframe';
import MVTMetadata from '../MVTMetadata';
import Base from '../Base';
import BigQueryTileClient from './BQTileClient';
import BigQueryTilesetClient from './BQTilesetClient';
import Worker from '../Workers.worker';

const DEFAULT_ID_PROPERTY = '___id';

/**
 * BigQueryTileset source: PoC based on the MVT source to fetch tiles directly from a tileset in BigQuery.
 *
 * @param {object} data - BigQuery data to reference the tileset:
 * @param {string} data.project - The name of the BigQuery project.
 * @param {string} data.dataset - The name of the BigQuery dataset.
 * @param {string} data.table  - The name of the BigQuery table.
 * @param {string} data.token   - The token to authorize requests to the BigQuery project.
 *
 * @param {object} [metadata] - Optional attributes to overwrite tileset metadata:
 * @param {object} [metadata.vector_layers] - The information about available layers in the vector tiles.
 * @param {string} [metadata.maxzoom]     - The maximum zoom with tiles data ('14').
 * @param {string} [metadata.minzoom]     - The minimum zoom with tiles data ('4').
 * @param {string} [metadata.center]      - The initial position and zoom of the map ('-76.124268,38.933775,14')
 * @param {string} [metadata.bounds]      - The global bounds with tiles data available ('78.178689,0.000000,0.000000,39.719731').
 * @param {string} [metadata.compression] - The type of tile compression ('gzip').
 * @param {string} [metadata.tile_extent] - The size and resolution of the tile ('4096').
 * @param {object} [metadata.carto_partition] - The quadkey optimization params ({"version":1,"partitions":4000,"zmin":0,"zmax":14,"xmin":4634,"xmax":4747,"ymin":6219,"ymax":6322}).
 * @param {string} [metadata.extend_maxzoom_tiles] - A flag to use the max zoom tiles for bigger zoom values. Default is false.
 */
export default class BigQueryTileset extends Base {
    constructor (data, metadata = {}) {
        super();

        this._tilesetData = data;
        this._tilesetMetadata = metadata;
        this._tileClient = new BigQueryTileClient();

        this._mID = 0;
        this._workerDispatch = {};
        this._workerName = 'BigQueryTileset';
    }

    _initMetadata (metadata) {
        metadata = new MVTMetadata(metadata);
        metadata.setCodecs();
        this._metadata = metadata;
    }

    _initOptions (options) {
        this._options = options;
    }

    get _worker () {
        if (!this._workerInstance) {
            this._workerInstance = new Worker();
            this._workerInstance.onmessage = this._receiveMessageFromWorker.bind(this);
        }
        return this._workerInstance;
    }

    _receiveMessageFromWorker (event) {
        const { mID, dataframes } = event.data;
        for (let i = 0; i < dataframes.length; i++) {
            const dataframe = dataframes[i];
            if (!dataframe.empty) {
                this._updateMetadataWith(dataframe);
            }
        }
        this._workerDispatch[mID](dataframes);
    }

    _updateMetadataWith (dataframe) {
        Object.setPrototypeOf(dataframe, Dataframe.prototype);
        const metadata = dataframe.metadata;

        this._metadata.numCategories = metadata.numCategories;
        this._metadata.categoryToID = metadata.categoryToID;
        this._metadata.IDToCategory = metadata.IDToCategory;
        this._metadata.geomType = metadata.geomType;

        dataframe.metadata = this._metadata;
    }

    _clone () {
        return this;
    }

    bindLayer (addDataframe) {
        this._tileClient.bindLayer(addDataframe);
    }

    requiresNewMetadata () {
        return false;
    }

    async requestMetadata () {
        if (!this._metadata) {
            await this.initMetadata();
        }
        return this._metadata;
    }

    async initMetadata () {
        const client = new BigQueryTilesetClient(this._tilesetData.project, this._tilesetData.token);
        const tilesetMetadata = await client.fetchMetadata(this._tilesetData.dataset, this._tilesetData.table);

        this._tilesetMetadata = { ...tilesetMetadata, ...this._tilesetMetadata };

        const properties = {};
        const tilesetProps = this._tilesetMetadata.vector_layers[0].fields;

        for (let key in tilesetProps) {
            const type = tilesetProps[key] === 'String' ? 'category' : 'number';
            properties[key] = { type };
        }
        properties[DEFAULT_ID_PROPERTY] = { type: 'number' };

        const metadata = {
            idProperty: DEFAULT_ID_PROPERTY,
            properties,
            extent: parseInt(this._tilesetMetadata.tile_extent)
        };

        const minZoom = parseInt(this._tilesetMetadata.minzoom);
        const maxZoom = parseInt(this._tilesetMetadata.maxzoom);
        const options = {
            viewportZoomToSourceZoom: (zoom) => {
                if (zoom > maxZoom) {
                    return this._tilesetMetadata.extend_maxzoom_tiles ? maxZoom : null;
                }
                if (zoom < minZoom) {
                    return null;
                }
                return Math.floor(zoom);
            }
        };

        if (this._tilesetMetadata.center) {
            const rawCenter = this._tilesetMetadata.center.split(',');
            this._tilesetMetadata.center = {
                longitude: parseFloat(rawCenter[0]),
                latitude: parseFloat(rawCenter[1]),
                zoom: parseInt(rawCenter[2])
            };
        }

        if (this._tilesetMetadata.bounds) {
            const rawBounds = this._tilesetMetadata.bounds.split(',');
            // [xmin, ymin, xmax, ymax]
            this._tilesetMetadata.bounds = [
                parseFloat(rawBounds[0]),
                parseFloat(rawBounds[1]),
                parseFloat(rawBounds[2]),
                parseFloat(rawBounds[3])
            ];
        }

        this._initMetadata(metadata);
        this._initOptions(options);
    }

    requestData (zoom, viewport) {
        const requestDataframes = this._requestDataframes.bind(this);
        const viewportZoomToSourceZoom = this._viewportZoomToSourceZoom.bind(this);

        return this._tileClient.requestData(zoom, viewport,
            requestDataframes, viewportZoomToSourceZoom, this._tilesetMetadata.bounds
        );
    }

    async _requestDataframes (tiles) {
        return new Promise(resolve => {
            this._postMessageToWorker(tiles);

            this._metadataSent = true;
            this._workerDispatch[this._mID] = resolve;
            this._mID++;
        });
    }

    _postMessageToWorker (tiles) {
        this._worker.postMessage({
            tiles,
            tilesetData: this._tilesetData,
            tilesetMetadata: this._tilesetMetadata,
            metadata: this._metadataSent ? undefined : this._metadata,
            mID: this._mID,
            workerName: this._workerName
        });
    }

    _viewportZoomToSourceZoom (zoom) {
        return this._options.viewportZoomToSourceZoom(zoom);
    }

    free () {
        this._tileClient.free();
    }
}
