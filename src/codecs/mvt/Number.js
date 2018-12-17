import NumberCodec from '../Number';
import CartoRuntimeError, { CartoRuntimeTypes as crt } from '../../errors/carto-runtime-error';
import { FP32_DESIGNATED_NULL_VALUE } from '../../renderer/viz/expressions/constants';

export default class MVTNumberCodec extends NumberCodec {
    sourceToInternal (propertyValue) {
        if (isNaN(propertyValue) || propertyValue == null) {
            propertyValue = FP32_DESIGNATED_NULL_VALUE;
        }
        if (typeof propertyValue !== 'number') {
            throw new CartoRuntimeError(`${crt.MVT} MVT decoding error. Metadata property is of type 'number' but the MVT tile contained a feature property of type '${typeof propertyValue}': '${propertyValue}'`);
        }
        return super.sourceToInternal(propertyValue);
    }
}
