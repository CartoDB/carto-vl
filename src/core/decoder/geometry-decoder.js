import { decodePoint } from './point';
import { decodePolygon } from './polygon';
import { decodeLine } from './line';

const geometryTypes = {
    POINT: 'point',
    LINE: 'line',
    POLYGON: 'polygon'
};

/* 
* Builds a triangulated mesh from a polyline 
* The geom will be an array of coordinates in this case
**/

export function decodeGeometry(geometryType, geometry) {
    switch (geometryType) {
        case geometryTypes.POINT:
            return decodePoint(geometry);
        case geometryTypes.POLYGON:
            return decodePolygon(geometry);
        case geometryTypes.LINE:
            return decodeLine(geometry);
        default:
            throw new Error(`Unimplemented geometry type: '${geometryType}'`);
    }
}
