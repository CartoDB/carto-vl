import DataframeCodec from '../renderer/DataframeCodec';
import util from '../utils/util';

export default class MVTCodec extends DataframeCodec {
    encode (propertyName, propertyValue) {
        const metadataPropertyType = this.properties[propertyName].type;
        switch (metadataPropertyType) {
            case 'category':
                return this.categorizeString(propertyName, propertyValue);
            case 'number':
                return Number(propertyValue);
            case 'date':
                const { min, max } = this.properties[propertyName];
                // dates in Dataframes are mapped to [0,1] to maximize precision
                const d = util.castDate(propertyValue).getTime();
                return (d - min.getTime()) / (max.getTime() - min.getTime());
            default:
                const numericValue = Number(propertyValue);
                return Number.isNaN(numericValue) ? Number.MIN_SAFE_INTEGER : numericValue;
        }
    }

    decode (propertyName, propertyValue) {
        const metadataPropertyType = this.properties[propertyName].type;
        switch (metadataPropertyType) {
            case 'category':
                return this.IDToCategory.get(propertyValue);
            case 'date':
                let value = propertyValue;
                const { min, max } = this.properties[propertyName];
                value *= (max.getTime() - min.getTime());
                value += min.getTime();
                const d = new Date();
                d.setTime(value);
                return d;
            default:
                if (propertyValue === Number.MIN_SAFE_INTEGER) {
                    propertyValue = Number.NaN;
                }
                return propertyValue;
        }
    }
}
