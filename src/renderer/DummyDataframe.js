import { decodeGeom } from './decoder';
import { computeAABB } from '../utils/geometry';

export default class DummyDataframe {
    constructor ({ center, scale, geom, properties, type, active, size, metadata }) {
        this.active = active;
        this.center = center;
        this.properties = properties;
        this.scale = scale;
        this.type = type;
        this.decodedGeom = decodeGeom(type, geom);
        this.numVertex = type === 'point'
            ? size * 3
            : this.decodedGeom.vertices.length / 2;
        this.numFeatures = type === 'point' ? size : this.decodedGeom.breakpoints.length || this.numVertex;
        this.propertyTex = [];
        this.metadata = metadata;
        this.propertyCount = 0;
        this._aabb = computeAABB(geom, type);

        this._freeIndex = [];
        this._lastIndex = 0;
        this._idToIndex = {};
    }
}
