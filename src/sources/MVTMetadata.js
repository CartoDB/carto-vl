import Metadata from '../renderer/Metadata';
import CartoRuntimeError, { CartoRuntimeTypes as crt } from '../errors/carto-runtime-error';

export default class MVTMetadata extends Metadata {
    // convert source values to internal representation
    decode (propertyName, propertyValue) {
        const metadataPropertyType = this.properties[propertyName].type;
        if (typeof propertyValue === 'string') {
            if (metadataPropertyType !== 'category') {
                throw new CartoRuntimeError(`${crt.MVT} MVT decoding error. Metadata property '${propertyName}' is of type '${metadataPropertyType}' but the MVT tile contained a feature property of type 'string': '${propertyValue}'`);
            }
            return this.categorizeString(propertyName, propertyValue);
        } else if (typeof propertyValue === 'number') {
            if (metadataPropertyType !== 'number') {
                throw new CartoRuntimeError(`${crt.MVT} MVT decoding error. Metadata property '${propertyName}' is of type '${metadataPropertyType}' but the MVT tile contained a feature property of type 'number': '${propertyValue}'`);
            }
            return propertyValue;
        } else if (propertyValue === null || propertyValue === undefined) {
            return Number.NaN;
        } else {
            throw new CartoRuntimeError(`${crt.MVT} MVT decoding error. Feature property value of type '${typeof propertyValue}' cannot be decoded.`);
        }
    }

    // convert internal representation to user
    encode (propertyName, propertyValue) {
        const metadataPropertyType = this.properties[propertyName].type;
        switch (metadataPropertyType) {
            case 'category':
                return this.IDToCategory.get(propertyValue);
            default:
                return propertyValue;
        }
    }
}
