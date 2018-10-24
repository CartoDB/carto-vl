import NumberCodec from './Number';
import CategoryCodec from './Category';
import CartoRuntimeError, { CartoRuntimeTypes as crt } from '../errors/carto-runtime-error';

export default function codecFactory (metadata, type, propertyName) {
    switch (type) {
        case 'number':
            return new NumberCodec();
        case 'category':
            return new CategoryCodec(metadata, propertyName);
        default:
            throw new CartoRuntimeError(
                `${crt.NOT_SUPPORTED} Feature property value of type '${type}' cannot be decoded.`
            );
    }
}
