import GeometryUtils from '../../utils/geometry';

/*
    All this clockwise non-sense is needed because the MVT decoder dont decode the MVT fully.
    It doesn't distinguish between internal polygon rings (which defines holes) or external ones, which defines more polygons (mulipolygons)
    See:
        https://github.com/mapbox/vector-tile-spec/tree/master/2.1
        https://en.wikipedia.org/wiki/Shoelace_formula
*/
export function decodePolygons(polygons, featureGeometries, mvtExtent) {
    let currentPolygon = null;
    let decodedPolygons = [];

    polygons.forEach((polygon, index) => {
        const isExternalPolygon = GeometryUtils.isClockWise(polygon);
        const preClippedVertices = _getPreClippedVertices(polygon, mvtExtent);

        if (_isFirstPolygonInternal(isExternalPolygon, index)) {
            throw new Error('Invalid MVT tile: first polygon ring MUST be external');
        }

        if (isExternalPolygon) {
            if (currentPolygon) {
                decodedPolygons.push(currentPolygon);
            }

            currentPolygon = {
                flat: [],
                holes: [],
                clipped: [],
                clippedType: [], // Store a bitmask of the clipped half-planes
            };
        }

        currentPolygon = GeometryUtils.clipPolygon(
            preClippedVertices,
            currentPolygon, !isExternalPolygon
        );
    });

    if (currentPolygon) {
        decodedPolygons.push(currentPolygon);
    }

    featureGeometries.push(decodedPolygons);

    return featureGeometries;
}

function _isFirstPolygonInternal(isExternalPolygon, index) {
    const IS_FIRST_POLYGON = index === 0;
    return !isExternalPolygon && IS_FIRST_POLYGON;
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
