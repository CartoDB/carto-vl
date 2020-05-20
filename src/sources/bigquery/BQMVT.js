
import Dataframe from '../../renderer/dataframe/Dataframe';
import Metadata from '../../renderer/Metadata';
import MVTMetadata from '../MVTMetadata';
import Base from '../Base';
import BQClient from './BQClient';
import BQTileClient from './BQTileClient';
import Worker from '../MVTWorkers.worker';
import { fetchMetadata } from './utils';

/*
 *  This is a PoC based on the MVT source to fetch the tiles directly from BigQuery
 */

export default class BQMVT extends Base {
    constructor (bqSource, options = {}) {
        super();

        this._metadata = null;
        this._bqSource = bqSource;
        this._tilesetOptions = { ...{ fitBounds: false }, ...options };
        this._tileClient = new BQTileClient();

        this._workerDispatch = {};
        this._mID = 0;
        this._workerName = 'BQMVT';
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
                layerID: undefined,
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
            await this.initMetadata(this._bqSource);
        }
        return this._metadata;
    }

    async initMetadata (bqSource) {
        const client = new BQClient(bqSource.project, bqSource.token);
        this._tilesetMetadata = await fetchMetadata(client, bqSource.dataset, bqSource.tileset);

        const properties = {};
        const tilesetProps = JSON.parse(this._tilesetMetadata.properties);

        for (let key in tilesetProps) {
            const prop = tilesetProps[key];
            const type = prop.type === 'STRING' ? 'category' : 'number';
            properties[key] = { type };
        }

        const metadata = {
            idProperty: this._tilesetMetadata.id || 'identifier',
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
            bqSource: this._bqSource,
            layerID: this._options.layerID,
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
