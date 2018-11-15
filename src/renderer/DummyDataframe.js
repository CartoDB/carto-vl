import { decodeGeom } from './decoder';
import { computeAABB, computeCentroids } from '../utils/geometry';

export default class DummyDataframe {
    constructor ({ center, scale, geom, properties, propertiesArrayBuffer, type, active, size, metadata }) {
        this.active = active;
        this.center = center;
        this.properties = properties;
        this.propertiesArrayBuffer = propertiesArrayBuffer;
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
        this._centroids = computeCentroids(this.decodedGeom, type);
        this.t1 = [0.1, 0.1, 0.1, 0.1];
        this.t2 = [0.1, 0.1, 0.1, 0.1];
        this.t3 = [0.1, 0.1, 0.1, 0.1];
        this.t4 = [0.1, 0.1, 0.1, 0.1];
    }
}
