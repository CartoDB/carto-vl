import { decodePoint } from './pointDecoder';
import { decodeLine } from './lineDecoder';
import { decodePolygon } from './polygonDecoder';
import CartoValidationError from '../../errors/carto-validation-error';

export function decodeGeom (geomType, geom) {
    switch (geomType) {
        case 'point':
            return decodePoint(geom);
        case 'line':
            return decodeLine(geom);
        case 'polygon':
            return decodePolygon(geom);
        default:
            throw new CartoValidationError('renderer', `unimplementedGeometryType[${geomType}]`);
    }
}
