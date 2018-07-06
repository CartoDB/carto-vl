import Metadata from '../renderer/Metadata';
import Base from './Base';
import MvtClient from '../client/MvtClient';


export default class MVT extends Base {

    /**
     * Create a carto.source.MVT.
     *
     * @param {object} data - A MVT data object
     * @param {object} [metadata] - A carto.source.mvt.Metadata object
     * @param {string} [layerId] - layerID on the MVT tiles to decode, the parameter is optional if the MVT tiles only contains one layer
     *
     * @example
     * const metadata = new carto.source.mvt.Metadata([{ type: 'number', name: 'total_pop'}])
     * new carto.source.MVT("https://{server}/{z}/{x}/{y}.mvt", metadata);
     *
     * @fires CartoError
     *
     * @constructor MVT
     * @extends carto.source.Base
     * @memberof carto.source
     * @IGNOREapi
     */
    constructor(templateURL, metadata = new Metadata(), layerId) {
        super();
        this._templateURL = templateURL;
        if (!(metadata instanceof Metadata)) {
            metadata = new Metadata(metadata);
        }
        this._metadata = metadata;
        this._mvtClient = new MvtClient(templateURL, metadata, layerId);
    }

    bindLayer(addDataframe, dataLoadedCallback) {
        this._mvtClient.setCallbacks({
            onDataFrameLoaded: addDataframe,
            onDataLoaded: dataLoadedCallback
        });
    }

    async requestMetadata() {
        return this._metadata;
    }

    requiresNewMetadata() {
        return false;
    }

    requestData(viewport) {
        this._mvtClient.requestData(viewport);
    }

    clone() {
        return new MVT(this._templateURL, JSON.parse(JSON.stringify(this._metadata)), this._layerID);
    }

    free() {
        this._mvtClient.free();
    }
}
