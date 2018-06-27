import geometryUtils from '../../utils/geometry';
export class Polygon {
    constructor() {
        this.flat = [];
        this.holes = [];
        this.clipped = [];
        this.clippedType = []; // Store a bitmask of the clipped half-planes
    }
}

export function decodeLines(geom, mvt_extent) {
    return geom.map(l => {
        let line = [];
        l.forEach(point => {
            line.push(2 * point.x / mvt_extent - 1, 2 * (1 - point.y / mvt_extent) - 1);
        });
        return line;
    });
}

/*
    All this clockwise non-sense is needed because the MVT decoder dont decode the MVT fully.
    It doesn't distinguish between internal polygon rings (which defines holes) or external ones, which defines more polygons (mulipolygons)
    See:
        https://github.com/mapbox/vector-tile-spec/tree/master/2.1
        https://en.wikipedia.org/wiki/Shoelace_formula
*/
export function decodePolygons(geometries, mvtExtent) {
    let currentPolygon = null;
    let decoded = [];
    let invertedOrientation;
    geometries.forEach(geom => {
        let area = signedPolygonArea(geom);
        if (area == 0) {
            return;
        }
        if (invertedOrientation === undefined) {
            // According to the MVT spec this condition cannot happen for
            // MVT spec compliant tiles, but many buggy implementations
            // don't comply with this rule when generating tiles
            // Also, other implementations accept this out-of-the-spec condition
            invertedOrientation = area > 0;
        }
        const isExternalPolygon = invertedOrientation ? area > 0 : area < 0;



        const preClippedVertices = _getPreClippedVertices(geom, mvtExtent);

        if (isExternalPolygon) {
            if (currentPolygon) {
                decoded.push(currentPolygon);
            }

            currentPolygon = new Polygon();
        }

        currentPolygon = clipPolygon(preClippedVertices, currentPolygon, !isExternalPolygon);
    });

    if (currentPolygon) {
        decoded.push(currentPolygon);
    }

    return decoded;
}

export function signedPolygonArea(vertices) {
    // https://en.wikipedia.org/wiki/Shoelace_formula
    let a = 0;
    for (let i = 0; i < vertices.length; i++) {
        let j = (i + 1) % vertices.length;
        a += vertices[i].x * vertices[j].y;
        a -= vertices[j].x * vertices[i].y;
    }
    return a / 2;
}

export function clipPolygon(preClippedVertices, polygon, isHole) {
    // Sutherland-Hodgman Algorithm to clip polygons to the tile
    // https://www.cs.drexel.edu/~david/Classes/CS430/Lectures/L-05_Polygons.6.pdf
    const clippingEdges = [
        p => p[0] <= 1,
        p => p[1] <= 1,
        p => p[0] >= -1,
        p => p[1] >= -1,
    ];

    const clippingEdgeIntersectFn = [
        (a, b) => geometryUtils.intersect(a, b, [1, -10], [1, 10]),
        (a, b) => geometryUtils.intersect(a, b, [-10, 1], [10, 1]),
        (a, b) => geometryUtils.intersect(a, b, [-1, -10], [-1, 10]),
        (a, b) => geometryUtils.intersect(a, b, [-10, -1], [10, -1]),
    ];

    // for each clipping edge
    for (let i = 0; i < 4; i++) {
        const preClippedVertices2 = [];

        // for each edge on polygon
        for (let k = 0; k < preClippedVertices.length - 1; k++) {
            // clip polygon edge
            const a = preClippedVertices[k];
            const b = preClippedVertices[k + 1];

            const insideA = clippingEdges[i](a);
            const insideB = clippingEdges[i](b);

            if (insideA && insideB) {
                // case 1: both inside, push B vertex
                preClippedVertices2.push(b);
            } else if (insideA) {
                // case 2: just B outside, push intersection
                const intersectionPoint = clippingEdgeIntersectFn[i](a, b);
                preClippedVertices2.push(intersectionPoint);
            } else if (insideB) {
                // case 4: just A outside: push intersection, push B
                const intersectionPoint = clippingEdgeIntersectFn[i](a, b);
                preClippedVertices2.push(intersectionPoint);
                preClippedVertices2.push(b);
            } else {
                // case 3: both outside: do nothing
            }
        }
        if (preClippedVertices2.length) {
            preClippedVertices2.push(preClippedVertices2[0]);
        }
        preClippedVertices = preClippedVertices2;
    }

    if (preClippedVertices.length > 3) {
        if (isHole) {
            polygon.holes.push(polygon.flat.length / 2);
        }
        preClippedVertices.forEach(v => {
            polygon.flat.push(v[0], v[1]);
        });
    }

    return polygon;
}

function _getPreClippedVertices(geom, mvtExtent) {
    return geom.map((coord) => {
        let x = coord.x;
        let y = coord.y;

        x = 2 * x / mvtExtent - 1;
        y = 2 * (1 - y / mvtExtent) - 1;

        return [x, y];
    });
}
