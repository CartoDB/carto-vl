import NumberCodec from '../Number';
import CartoRuntimeError, { CartoRuntimeTypes as crt } from '../../errors/carto-runtime-error';

export default class MVTNumberCodec extends NumberCodec {
    sourceToInternal (propertyValue) {
        if (typeof propertyValue !== 'number') {
            throw new CartoRuntimeError(`${crt.MVT} MVT decoding error. Metadata property is of type 'number' but the MVT tile contained a feature property of type '${typeof propertyValue}': '${propertyValue}'`);
        }
        return super.sourceToInternal(propertyValue);
    }
}
