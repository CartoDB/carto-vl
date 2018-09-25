import Metadata from '../renderer/Metadata';

export default class GeoJSONMetadata extends Metadata {

    // convert source values to internal representation
    decode(propertyName, propertyValue) {
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
                const n = (d - min.getTime()) / (max.getTime() - min.getTime());
                properties[name][i] = n;
            default:
                return propertyValue;
        }
    }

    // convert internal representation to user
    encode(propertyName, propertyValue) {
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
                d.setTime(1000 * value);
                return d;
            default:
                return propertyValue;
        }
    }
}


