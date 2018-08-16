import { decodePoint } from './pointDecoder';
import { decodeLine } from './lineDecoder';
import { decodePolygon } from './polygonDecoder';

export function decodeGeom (geomType, geom, options) {
    options = options || {};
    switch (geomType) {
        case 'point':
            return decodePoint(geom);
        case 'line':
            return decodeLine(geom, options);
        case 'polygon':
            return decodePolygon(geom, options);
        default:
            throw new Error(`Unimplemented geometry type: '${geomType}'`);
    }
}
