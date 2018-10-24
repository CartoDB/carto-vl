import Metadata from '../renderer/Metadata';
import codecFactory from '../codecs';

export default class GeoJSONMetadata extends Metadata {
    setCodecs () {
        Object.keys(this.properties).forEach(propertyName => {
            const property = this.properties[propertyName];
            const type = property.type;
            if (type !== 'geometry') {
                property.codec = codecFactory(this, type, propertyName);
            }
        });
    }
}
