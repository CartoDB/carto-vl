import NumberCodec from '../Number';
import CartoRuntimeError, { CartoRuntimeTypes as runtimeErrors } from '../../errors/carto-runtime-error';

export default class MVTNumberCodec extends NumberCodec {
    sourceToInternal (metadata, propertyValue) {
        const propertyValueType = typeof propertyValue;
        if (propertyValue !== null && propertyValueType !== 'undefined' && propertyValueType !== 'number') {
            throw new CartoRuntimeError(`${runtimeErrors.MVT} MVT decoding error. Metadata property '${this._baseName}' is of type 'number' but the MVT tile contained a feature property of type '${propertyValueType}': '${propertyValue}'`);
        }
        return super.sourceToInternal(metadata, propertyValue);
    }
}
