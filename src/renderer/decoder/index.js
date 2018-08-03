import { decodePoint } from './pointDecoder';
import { decodeLine } from './lineDecoder';
import { decodePolygon } from './polygonDecoder';

const geomLineBuffer = {
    index: 0,
    vertices: new Float32Array(8 * 1024 * 1024 / 32),
    normals: new Float32Array(8 * 1024 * 1024 / 32)
};

const geomPolygonBuffer = {
    index: 0,
    vertices: new Float32Array(2000000),
    normals: new Float32Array(2000000)
};

export function decodeGeom (geomType, geom) {
    switch (geomType) {
        case 'point':
            return decodePoint(geom);
        case 'line':
            return decodeLine(geom, geomLineBuffer);
        case 'polygon':
            return decodePolygon(geom, geomPolygonBuffer);
        default:
            throw new Error(`Unimplemented geometry type: '${geomType}'`);
    }
}
