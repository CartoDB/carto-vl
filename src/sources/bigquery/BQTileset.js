
import Dataframe from '../../renderer/dataframe/Dataframe';
import Metadata from '../../renderer/Metadata';
import MVTMetadata from '../MVTMetadata';
import Base from '../Base';
import BigQueryTileClient from './BQTileClient';
import BigQueryTilesetClient from './BQTilesetClient';
import Worker from '../Workers.worker';

/**
 * BigQueryTileset source: PoC based on the MVT source to fetch tiles directly from a tileset in BigQuery.
 *
 * @param {object} data - BigQuery data to reference the tileset:
 * @param {string} data.project - The name of the BigQuery project.
 * @param {string} data.dataset - The name of the BigQuery dataset.
 * @param {string} data.tileset - The name of the BigQuery tileset table.
 * @param {string} data.token   - The token to authorize requests to the BigQuery project.
 *
 * @param {object} [metadata] - Optional attributes to overwrite tileset metadata:
 * @param {string} [metadata.id_property] - The name of the ID property ('cartodb_id', 'geoid').
 * @param {object} [metadata.properties]  - The information about available columns and types in the MVT ('{"geoid": {"type": "STRING"}, ...').
 * @param {string} [metadata.maxzoom]     - The maximum zoom with tiles data ('14').
 * @param {string} [metadata.minzoom]     - The minimum zoom with tiles data ('4').
 * @param {string} [metadata.center]      - The initial position and zoom of the map ('-76.124268,38.933775,14')
 * @param {string} [metadata.bounds]      - The global bounds with tiles data available ('78.178689,0.000000,0.000000,39.719731').
 * @param {string} [metadata.compression] - The type of tile compression ('gzip').
 * @param {string} [metadata.tile_extent] - The size and resolution of the tile ('4096').
 * @param {string} [metadata.carto_quadkey_zoom] - The zoom level for quadkey optimization ('8')
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
        if (!(metadata instanceof Metadata)) {
            metadata = new MVTMetadata(metadata);
        }

        metadata.setCodecs();
        this._metadata = metadata;
    }

    _initOptions (options) {
        if (options === undefined) {
            options = {
                viewportZoomToSourceZoom: Math.ceil,
                maxZoom: undefined
            };
        }

        options.viewportZoomToSourceZoom = options.viewportZoomToSourceZoom || Math.ceil;
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

    async requestMetadata () {
        if (!this._metadata) {
            await this.initMetadata();
        }
        return this._metadata;
    }

    async initMetadata () {
        const client = new BigQueryTilesetClient(this._tilesetData.project, this._tilesetData.token);
        const tilesetMetadata = await client.fetchMetadata(this._tilesetData.dataset, this._tilesetData.tileset);

        this._tilesetMetadata = { ...tilesetMetadata, ...this._tilesetMetadata };

        const properties = {};
        const tilesetProps = JSON.parse(this._tilesetMetadata.properties);

        for (let key in tilesetProps) {
            const prop = tilesetProps[key];
            const type = prop.type === 'STRING' ? 'category' : 'number';
            properties[key] = { type };
        }

        const metadata = {
            idProperty: this._tilesetMetadata.id_property,
            properties,
            extent: parseInt(this._tilesetMetadata.tile_extent)
        };

        const maxZoom = parseInt(this._tilesetMetadata.maxzoom);
        const options = {
            maxZoom,
            viewportZoomToSourceZoom: (zoom) => {
                if (zoom > maxZoom) {
                    return maxZoom;
                }
                return Math.ceil(zoom);
            }
        };

        this._initMetadata(metadata);
        this._initOptions(options);
    }

    requestData (zoom, viewport) {
        const requestDataframes = this._requestDataframes.bind(this);
        const viewportZoomToSourceZoom = this._viewportZoomToSourceZoom.bind(this);

        return this._tileClient.requestData(zoom, viewport,
            requestDataframes, viewportZoomToSourceZoom
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
        const maxZoom = this._options.maxZoom;
        const sourceZoom = this._options.viewportZoomToSourceZoom(zoom);

        if (maxZoom === undefined) {
            return sourceZoom;
        }

        return Math.min(sourceZoom, maxZoom);
    }

    free () {
        this._tileClient.free();
    }
}
