import { MVTWorker } from '../sources/MVTWorker';
import WindshaftMetadata from './WindshaftMetadata';
import WindshaftCodec from './WindshaftCodec';

export class WindshaftWorker extends MVTWorker {
    castMetadata (metadata) {
        Object.setPrototypeOf(metadata, WindshaftMetadata.prototype);
        metadata.setCodec(new WindshaftCodec());
    }
}
