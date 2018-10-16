import DataframeCodec from '../renderer/DataframeCodec';
import CartoRuntimeError, { CartoRuntimeTypes as crt } from '../errors/carto-runtime-error';

export default class MVTCodec extends DataframeCodec {
    encode (propertyName, propertyValue) {
        const metadataPropertyType = this.properties[propertyName].type;
        if (typeof propertyValue === 'string') {
            if (metadataPropertyType !== 'category') {
                throw new CartoRuntimeError(`${crt.MVT} MVT decoding error. Metadata property '${propertyName}' is of type '${metadataPropertyType}' but the MVT tile contained a feature property of type 'string': '${propertyValue}'`);
            }
            return this.categorizeString(propertyName, propertyValue);
        } else if (propertyValue === null || propertyValue === undefined || Number.isNaN(propertyValue)) {
            return Number.MIN_SAFE_INTEGER;
        } else if (typeof propertyValue === 'number') {
            if (metadataPropertyType !== 'number') {
                throw new CartoRuntimeError(`${crt.MVT} MVT decoding error. Metadata property '${propertyName}' is of type '${metadataPropertyType}' but the MVT tile contained a feature property of type 'number': '${propertyValue}'`);
            }
            return propertyValue;
        } else {
            throw new CartoRuntimeError(`${crt.MVT} MVT decoding error. Feature property value of type '${typeof propertyValue}' cannot be decoded.`);
        }
    }

    decode (propertyName, propertyValue) {
        const metadataPropertyType = this.properties[propertyName].type;
        switch (metadataPropertyType) {
            case 'category':
                return this.IDToCategory.get(propertyValue);
            default:
                if (propertyValue === Number.MIN_SAFE_INTEGER) {
                    return Number.NaN;
                }
                return propertyValue;
        }
    }
}
