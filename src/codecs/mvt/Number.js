import NumberCodec from '../Number';
import CartoRuntimeError, { CartoRuntimeTypes as crt } from '../../errors/carto-runtime-error';

export default class MVTNumberCodec extends NumberCodec {
    sourceToInternal (metadata, propertyValue) {
        const propertyValueType = typeof propertyValue;
        if (propertyValue !== null && propertyValueType !== 'undefined' && propertyValueType !== 'number') {
            throw new CartoRuntimeError(`${crt.MVT} MVT decoding error. Metadata property is of type 'number' but the MVT tile contained a feature property of type '${propertyValueType}': '${propertyValue}'`);
        }
        return super.sourceToInternal(metadata, propertyValue);
    }
}
