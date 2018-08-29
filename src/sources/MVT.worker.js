import { VectorTile } from '@mapbox/vector-tile';
import * as Protobuf from 'pbf';
import * as rsys from '../client/rsys';

class MVTWorker {
    // From TileClient

    _getTileUrl (x, y, z, templateURLs) {
        const subdomainIndex = this._getSubdomainIndex(x, y, templateURLs);
        return templateURLs[subdomainIndex].replace('{x}', x).replace('{y}', y).replace('{z}', z);
    }

    _getSubdomainIndex (x, y, templateURLs) {
        // Reference https://github.com/Leaflet/Leaflet/blob/v1.3.1/src/layer/tile/TileLayer.js#L214-L217
        return Math.abs(x + y) % templateURLs.length;
    }

    async _requestDataframe (x, y, z, templateURLs) {
        const response = await fetch(this._getTileUrl(x, y, z, templateURLs));
        const dataframe = await this.responseToDataframeTransformer(response, x, y, z);
        return dataframe;
    }

    // From MVT

    async responseToDataframeTransformer (response, x, y, z) {
        const MVT_EXTENT = 4096;
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength === 0 || response === 'null') {
            return { empty: true };
        }
        const tile = new VectorTile(new Protobuf(arrayBuffer));

        if (Object.keys(tile.layers).length > 1 && !this._options.layerID) {
            throw new Error(`LayerID parameter wasn't specified and the MVT tile contains multiple layers: ${JSON.stringify(Object.keys(tile.layers))}`);
        }

        const mvtLayer = tile.layers[this._options.layerID || Object.keys(tile.layers)[0]]; // FIXME this!!!

        if (!mvtLayer) {
            return { empty: true };
        }

        const { geometries, properties, numFeatures } = this._decodeMVTLayer(mvtLayer, this._metadata, MVT_EXTENT);
        const rs = rsys.getRsysFromTile(x, y, z);
        const dataframe = this._generateDataFrame(rs, geometries, properties, numFeatures, this._metadata.geomType);

        return dataframe;
    }
}

const worker = new MVTWorker();

onmessage = function (event) {
    processEvent(event).then(message => {
        console.log(message);
        postMessage(message);
    });
};

async function processEvent (event) {
    const params = event.data;
    const dataframe = await worker._requestDataframe(params.x, params.y, params.z, params.templateURLs);
    return dataframe;
}
