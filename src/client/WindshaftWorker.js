import { MVTWorker } from '../sources/MVTWorker';
import WindshaftMetadata from './WindshaftMetadata';

export class WindshaftWorker extends MVTWorker {
    castMetadata (metadata) {
        Object.setPrototypeOf(metadata, WindshaftMetadata.prototype);
        metadata.setCodecs();
    }
}
