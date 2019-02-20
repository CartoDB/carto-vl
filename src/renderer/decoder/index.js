import { decodePoint } from './pointDecoder';
import { decodeLine } from './lineDecoder';
import { decodePolygon } from './polygonDecoder';
import CartoRuntimeError, { CartoRuntimeTypes as crt } from '../../errors/carto-runtime-error';
import { GEOMETRY_TYPE } from '../../utils/geometry';

export function decodeGeom (geomType, geom) {
    switch (geomType) {
        case GEOMETRY_TYPE.POINT:
            return decodePoint(geom);
        case GEOMETRY_TYPE.LINE:
            return decodeLine(geom);
        case GEOMETRY_TYPE.POLYGON:
            return decodePolygon(geom);
        default:
            throw new CartoRuntimeError(`${crt.NOT_SUPPORTED} Unimplemented geometry type: '${geomType}'.`);
    }
}
