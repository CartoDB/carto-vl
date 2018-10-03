import { decodePoint } from './pointDecoder';
import { decodeLine } from './lineDecoder';
import { decodePolygon } from './polygonDecoder';
import CartoRuntimeError, { CartoRuntimeTypes as crt } from '../../errors/carto-runtime-error';

export function decodeGeom (geomType, geom) {
    switch (geomType) {
        case 'point':
            return decodePoint(geom);
        case 'line':
            return decodeLine(geom);
        case 'polygon':
            return decodePolygon(geom);
        case 'grid':
            return {
                vertices: geom,
                verticesArrayBuffer: geom,
                breakpoints: []
            };
        default:
            throw new CartoRuntimeError(`${crt.NOT_SUPPORTED} Unimplemented geometry type: '${geomType}'.`);
    }
}
