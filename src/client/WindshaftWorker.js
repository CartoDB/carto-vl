import { MVTWorker } from '../sources/MVTWorker';
import schema from '../renderer/schema';
import CartoMapsAPIError, { CartoMapsAPITypes as cmt } from '../errors/carto-maps-api-error';

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
                throw new CartoMapsAPIError(
                    `${cmt.NOT_SUPPORTED} Windshaft MVT decoding error. Feature property value of type '${typeof propertyValue}' cannot be decoded.`
                );
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
