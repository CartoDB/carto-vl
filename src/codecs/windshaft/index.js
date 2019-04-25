import NumberCodec from '../Number';
import CategoryCodec from '../Category';
import WindshaftDateCodec from './WindshaftDate';
import TimeRangeCodec from './TimeRange';
import CartoMapsAPIError, { CartoMapsAPIErrorTypes } from '../../errors/carto-maps-api-error';

export default function windshaftCodecFactory (metadata, type, propertyName) {
    switch (type) {
        case 'number':
            return new NumberCodec(metadata, propertyName);
        case 'category':
            return new CategoryCodec(metadata, propertyName);
        case 'date':
            return new WindshaftDateCodec(metadata, propertyName);
        case 'timerange':
            return new TimeRangeCodec(metadata, propertyName);
        default:
            throw new CartoMapsAPIError(
                `Windshaft MVT decoding error. Feature property value of type '${type}' cannot be decoded.`,
                CartoMapsAPIErrorTypes.NOT_SUPPORTED);
    }
}
