import { MVTWorker } from '../sources/MVTWorker';
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

onmessage = worker.onmessage.bind(worker);
