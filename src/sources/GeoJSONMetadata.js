import Metadata from '../renderer/Metadata';
import GeoJSONCodec from './GeoJSONCodec';

export default class GeoJSONMetadata extends Metadata {
    constructor (options) {
        super({ codec: new GeoJSONCodec(), ...options });
    }
}
