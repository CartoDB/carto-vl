
import Dataframe from '../../renderer/dataframe/Dataframe';
import Metadata from '../../renderer/Metadata';
import MVTMetadata from '../MVTMetadata';
import Base from '../Base';
import BQTileClient from './BQTileClient';
import BQTileService from './BQTileService';

export default class BQMVT extends Base {
    constructor (bqSource, metadata = new MVTMetadata(), options) {
        super();

        this._bqSource = bqSource;
        this._tileClient = new BQTileClient();
        this._tileService = new BQTileService(bqSource);

        this._initMetadata(metadata);
        this._initOptions(options);
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
        return new BQMVT(this._bqSource, JSON.parse(JSON.stringify(this._metadata)), this._options);
    }

    bindLayer (addDataframe) {
        this._tileClient.bindLayer(addDataframe);
    }

    requestMetadata () {
        return this._metadata;
    }

    requestData (zoom, viewport) {
        const requestDataframes = this._requestDataframes.bind(this);
        const viewportZoomToSourceZoom = this._viewportZoomToSourceZoom.bind(this);

        return this._tileClient.requestData(zoom, viewport,
            requestDataframes, viewportZoomToSourceZoom
        );
    }

    async _requestDataframes (tiles) {
        const dataframes = await this._tileService.requestDataframes({
            tiles,
            layerID: this._options.layerID,
            metadata: this._metadata
        });
        for (let i = 0; i < dataframes.length; i++) {
            const dataframe = dataframes[i];
            if (!dataframe.empty) {
                this._updateMetadataWith(dataframe);
            }
        }
        return dataframes;
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
