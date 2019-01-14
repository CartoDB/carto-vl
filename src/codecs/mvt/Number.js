import NumberCodec from '../Number';
import CartoRuntimeError, { CartoRuntimeTypes as crt } from '../../errors/carto-runtime-error';
import { FP32_DESIGNATED_NULL_VALUE } from '../../renderer/viz/expressions/constants';

export default class MVTNumberCodec extends NumberCodec {
    sourceToInternal (metadata, propertyValue) {
        if (isNaN(propertyValue) || propertyValue == null) {
            propertyValue = FP32_DESIGNATED_NULL_VALUE;
        }
        const propertyValueType = typeof propertyValue;
        if (propertyValue !== null && propertyValueType !== 'undefined' && propertyValueType !== 'number') {
            throw new CartoRuntimeError(`${crt.MVT} MVT decoding error. Metadata property is of type 'number' but the MVT tile contained a feature property of type '${propertyValueType}': '${propertyValue}'`);
        }
        return super.sourceToInternal(metadata, propertyValue);
    }
}
