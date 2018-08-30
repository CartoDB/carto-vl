import { MVTWorker } from './MVTWorker';
import Metadata from '../renderer/Metadata';

const worker = new MVTWorker();

onmessage = function (event) {
    processEvent(event).then(message => {
        message.dataframe.geom = null;
        const transferables = [];
        if (!message.dataframe.empty) {
            transferables.push(message.dataframe.decodedGeom.verticesArrayBuffer);
            if (message.dataframe.decodedGeom.normalsArrayBuffer) {
                transferables.push(message.dataframe.decodedGeom.normalsArrayBuffer);
            }
        }
        postMessage(message, transferables);
    });
};

async function processEvent (event) {
    const params = event.data;
    Object.setPrototypeOf(params.metadata, Metadata.prototype);
    const dataframe = await worker._requestDataframe(params.x, params.y, params.z, params.url, params.layerID, params.metadata);
    return {
        mID: params.mID,
        dataframe
    };
}
