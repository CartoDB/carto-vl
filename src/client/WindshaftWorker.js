import { MVTWorker } from '../sources/MVTWorker';
import WindshaftMetadata from './WindshaftMetadata';
// import windshaftCodecFactory from './WindshaftCodec';

export class WindshaftWorker extends MVTWorker {
    castMetadata (metadata) {
        Object.setPrototypeOf(metadata, WindshaftMetadata.prototype);
        // setMetadataCodecs(metadata);
        metadata.setCodecs();
    }
}

// function setMetadataCodecs (metadata) {
//     // assign codecs
//     // a single codec kept per base property
//     // so, all its aggregations share the same encoding.
//     // form a dimension, the kept codec is that of the dimension
//     Object.keys(metadata.properties).forEach(baseName => {
//         const property = metadata.properties[baseName];
//         const baseType = property.type;
//         if (baseType !== 'geometry') {
//             const dimType = property.dimension ? property.dimension.type : null;
//             const dimName = dimType ? property.dimension.propertyName : baseName;
//             const actualDimType = (dimType === 'category' && property.dimension.range) ? 'timerange' : dimType;
//             property.codec = windshaftCodecFactory(metadata, actualDimType || baseType, dimName || baseName);
//         }
//     });
// }
