import { MVTWorker } from '../sources/MVTWorker';
import schema from '../renderer/schema';
import CartoMapsAPIError, { CartoMapsAPITypes as cmt } from '../errors/carto-maps-api-error';
import WindshaftMetadata from './WindshaftMetadata';

export class WindshaftWorker extends MVTWorker {
    castMetadata(metadata) {
        Object.setPrototypeOf(metadata, WindshaftMetadata.prototype);
    }
}
