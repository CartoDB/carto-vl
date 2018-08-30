import { MVTWorker } from '../sources/MVTWorker';
import Metadata from '../renderer/Metadata';
import schema from '../renderer/schema';

class WindshaftWorker extends MVTWorker {
    decodeProperty (metadata, propertyName, propertyValue) {
        const basename = schema.column.getBase(propertyName);
        const column = metadata.properties[basename];
        if (!column) {
            return;
        }
        switch (column.type) {
            case 'date':
            {
                const d = new Date();
                d.setTime(1000 * propertyValue);
                const min = column.min;
                const max = column.max;
                const n = (d - min) / (max.getTime() - min.getTime());
                return n;
            }
            case 'category':
                return metadata.categorizeString(basename, propertyValue);
            case 'number':
                return propertyValue;
            default:
                throw new Error(`Windshaft MVT decoding error. Feature property value of type '${typeof propertyValue}' cannot be decoded.`);
        }
    }
}

const worker = new WindshaftWorker();

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
