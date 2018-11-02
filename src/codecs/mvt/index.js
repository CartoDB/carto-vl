import NumberCodec from './Number';
import CategoryCodec from './Category';
import CartoRuntimeError, { CartoRuntimeTypes as crt } from '../../errors/carto-runtime-error';

export default function MVTCodecFactory (metadata, type, propertyName) {
    switch (type) {
        case 'number':
            return new NumberCodec();
        case 'category':
            return new CategoryCodec(metadata, propertyName);
        default:
            throw new CartoRuntimeError(
                `${crt.MVT} MVT decoding error. Feature property value of type '${type}' cannot be decoded.`
            );
    }
}
