import geometryUtils from '../../utils/geometry';

export class Polygon {
    constructor () {
        this.flat = [];
        this.holes = [];
        this.clipped = [];
        this.clippedType = []; // Store a bitmask of the clipped half-planes
    }
}

/*
    All this clockwise non-sense is needed because the MVT decoder dont decode the MVT fully.
    It doesn't distinguish between internal polygon rings (which defines holes) or external ones, which defines more polygons (mulipolygons)
    See:
        https://github.com/mapbox/vector-tile-spec/tree/master/2.1
        https://en.wikipedia.org/wiki/Shoelace_formula
*/
export function decodePolygons(geom, mvtExtent) {
    let currentPolygon = null;
    let decoded = [];

    geom.forEach((polygon, index) => {
        const isExternalPolygon = geometryUtils.isClockWise(polygon);
        const preClippedVertices = _getPreClippedVertices(polygon, mvtExtent);

        _checkIsFirstPolygonInternal(isExternalPolygon, index);
        _updateCurrentPolygon(isExternalPolygon, decoded, currentPolygon, preClippedVertices);
    });

    if (currentPolygon) {
        decoded.push(currentPolygon);
    }

    return decoded;
}

function _checkIsFirstPolygonInternal(isExternalPolygon, index) {
    const IS_FIRST_POLYGON = index === 0;

    if (!isExternalPolygon && IS_FIRST_POLYGON) {
        throw new Error('Invalid MVT tile: first polygon ring MUST be external');
    }
}

function _updateCurrentPolygon(isExternalPolygon, decoded, currentPolygon, preClippedVertices) {
    if (isExternalPolygon) {
        if (currentPolygon) {
            decoded.push(currentPolygon);
        }
        
        currentPolygon = new Polygon();
    }

    currentPolygon = geometryUtils.clipPolygon(preClippedVertices, currentPolygon, !isExternalPolygon);
}

function _getPreClippedVertices(polygon, mvtExtent) {
    return polygon.map((coord) => {
        const x = coord.x / mvtExtent - 1;
        const y = 2 * (1 - coord.y / mvtExtent) - 1;

        return [x, y];
    });
}

export default {
    decodePolygons
};
