import Metadata from '../renderer/Metadata';
import MVTCodecFactory from '../codecs/mvt';

export default class MVTMetadata extends Metadata {
    setCodecs () {
        Object.keys(this.properties).forEach(propertyName => {
            const property = this.properties[propertyName];
            const type = property.type;
            if (type !== 'geometry') {
                property.codec = MVTCodecFactory(this, type, propertyName);
            }
        });
    }
}
