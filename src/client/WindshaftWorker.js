import { MVTWorker } from '../sources/MVTWorker';
import schema from '../renderer/schema';
import CartoValidationError from '../errors/carto-validation-error';

export class WindshaftWorker extends MVTWorker {
    decodeProperty (metadata, propertyName, propertyValue) {
        const basename = schema.column.getBase(propertyName);
        const column = metadata.properties[basename];
        if (!column) {
            return;
        }
        switch (column.type) {
            case 'date':
                return decodeDate(column, propertyValue);
            case 'category':
                return metadata.categorizeString(basename, propertyValue);
            case 'number':
                return propertyValue;
            default:
                throw new CartoValidationError('windshaft', `decodingError[${typeof propertyValue}]`);
        }
    }
}

function decodeDate (column, propertyValue) {
    const d = new Date();
    d.setTime(1000 * propertyValue);
    const { min, max } = column;
    const n = (d - min) / (max.getTime() - min.getTime());
    return n;
}
