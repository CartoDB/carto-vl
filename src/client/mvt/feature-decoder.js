import geometryUtils from '../../utils/geometry';
export class Polygon {
    constructor () {
        this.flat = [];
        this.holes = [];
        this.clipped = [];
        this.clippedType = []; // Store a bitmask of the clipped half-planes
    }
}

export function decodeLines (geometries, mvtExtent) {
    let decodedGeometries = [];
    geometries.map(l => {
        let line = [];
        l.map(point => {
            line.push([2 * point.x / mvtExtent - 1, 2 * (1 - point.y / mvtExtent) - 1]);
        });
        decodedGeometries.push(...clipLine(line));
    });
    return decodedGeometries;
}

/*
    All this clockwise non-sense is needed because the MVT decoder dont decode the MVT fully.
    It doesn't distinguish between internal polygon rings (which defines holes) or external ones, which defines more polygons (mulipolygons)
    See:
        https://github.com/mapbox/vector-tile-spec/tree/master/2.1
        https://en.wikipedia.org/wiki/Shoelace_formula
*/
export function decodePolygons (geometries, mvtExtent) {
    let currentPolygon = null;
    let decoded = [];
    let invertedOrientation;
    geometries.forEach(geom => {
        let area = signedPolygonArea(geom);
        if (area === 0) {
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

export function signedPolygonArea (vertices) {
    // https://en.wikipedia.org/wiki/Shoelace_formula
    let a = 0;
    for (let i = 0; i < vertices.length; i++) {
        let j = (i + 1) % vertices.length;
        a += vertices[i].x * vertices[j].y;
        a -= vertices[j].x * vertices[i].y;
    }
    return a / 2;
}

const CLIPMAX = 1;
const CLIPMIN = -CLIPMAX;

const clippingEdges = [
    {
        // Right edge; x <= CLIPMAX for points inside
        inside: p => p[0] <= CLIPMAX,
        intersect: (a, b) => geometryUtils.intersect(a, b, [CLIPMAX, -100], [CLIPMAX, 100])
    },
    {
        // Top edge; y <= CLIPMAX for points inside
        inside: p => p[1] <= CLIPMAX,
        intersect: (a, b) => geometryUtils.intersect(a, b, [-100, CLIPMAX], [100, CLIPMAX])
    },
    {
        // Left edge; x >= CLIPMIN for points inside
        inside: p => p[0] >= CLIPMIN,
        intersect: (a, b) => geometryUtils.intersect(a, b, [CLIPMIN, -100], [CLIPMIN, 100])
    },
    {
        // Bottom edge; y >= CLIPMIN for points inside
        inside: p => p[1] >= CLIPMIN,
        intersect: (a, b) => geometryUtils.intersect(a, b, [-100, CLIPMIN], [100, CLIPMIN])
    }
];
const numberOfEdges = clippingEdges.length;

export function clipPolygon (preClippedVertices, polygon, isHole) {
    // Sutherland-Hodgman Algorithm to clip polygons to the tile
    // https://www.cs.drexel.edu/~david/Classes/CS430/Lectures/L-05_Polygons.6.pdf

    let clippedTypes = {};

    // for each clipping edge
    for (let i = 0; i < numberOfEdges; i++) {
        const preClippedVertices2 = [];
        const clippedTypes2 = {};

        const setClippedType = (vertexIndex, oldVertexIndex, edge = -1) => {
            let clippedType = 0;
            if (oldVertexIndex >= 0) {
                clippedType = clippedTypes[oldVertexIndex] || 0;
            }
            if (edge >= 0) {
                clippedType = clippedType | (1 << edge);
            }
            if (clippedType) {
                clippedTypes2[vertexIndex] = clippedType;
            }
        };

        // for each edge on polygon
        for (let k = 0; k < preClippedVertices.length - 1; k++) {
            // clip polygon edge
            const a = preClippedVertices[k];
            const b = preClippedVertices[k + 1];

            const insideA = clippingEdges[i].inside(a);
            const insideB = clippingEdges[i].inside(b);

            if (insideA && insideB) {
                // case 1: both inside, push B vertex
                setClippedType(preClippedVertices2.length, k + 1);
                preClippedVertices2.push(b);
            } else if (insideA) {
                // case 2: just B outside, push intersection
                const intersectionPoint = clippingEdges[i].intersect(a, b);
                setClippedType(preClippedVertices2.length, k + 1, i);
                preClippedVertices2.push(intersectionPoint);
            } else if (insideB) {
                // case 4: just A outside: push intersection, push B
                const intersectionPoint = clippingEdges[i].intersect(a, b);
                setClippedType(preClippedVertices2.length, k, i);
                preClippedVertices2.push(intersectionPoint);
                setClippedType(preClippedVertices2.length, k + 1);
                preClippedVertices2.push(b);
            } else {
                // case 3: both outside: do nothing
            }
        }
        if (preClippedVertices2.length) {
            if (clippedTypes2[0]) {
                clippedTypes2[preClippedVertices2.length] = clippedTypes2[0];
            }
            preClippedVertices2.push(preClippedVertices2[0]);
        }
        preClippedVertices = preClippedVertices2;
        clippedTypes = clippedTypes2;
    }

    // rings with less than 3 vertices are degenerate
    const MIN_VALID_NUM_VERTICES = 3;

    // preClippedVertices is closed by repeating the first vertex
    if (preClippedVertices.length >= MIN_VALID_NUM_VERTICES + 1) {
        if (isHole) {
            polygon.holes.push(polygon.flat.length / 2);
        }
        preClippedVertices.forEach(v => {
            polygon.flat.push(v[0], v[1]);
        });
        Object.keys(clippedTypes).forEach(i => {
            polygon.clipped.push(Number(i) * 2);
            polygon.clippedType.push(clippedTypes[i]);
        });
    }

    return polygon;
}

function _getPreClippedVertices (geom, mvtExtent) {
    return geom.map((coord) => {
        let x = coord.x;
        let y = coord.y;

        x = 2 * x / mvtExtent - 1;
        y = 2 * (1 - y / mvtExtent) - 1;

        return [x, y];
    });
}

function clipLine (line) {
    // linestring clipping based on the Cohen-Sutherland algorithm
    // input is a single linestring [point0, point1, ...]
    // output is an array of flat linestrings:
    // [[p0x, p0y, p1x, p1y, ...], ...]
    let clippedLine = [];
    const clippedLines = [];
    function clipType (point) {
        let type = 0;
        for (let i = 0; i < numberOfEdges; i++) {
            type = type | (clippingEdges[i].inside(point) ? 0 : (1 << i));
        }
        return type;
    }
    function intersect (point1, point2, type) {
        for (let i = 0; i < numberOfEdges; i++) {
            const mask = 1 << i;
            if (type & mask) {
                const p = clippingEdges[i].intersect(point1, point2);
                type = clipType(p) & ~mask;
                return [p, type];
            }
        }
    }
    let point0 = line[0];
    let type0 = clipType(point0);
    for (let i = 1; i < line.length; ++i) {
        let point1 = line[i];
        let type1 = clipType(point1);
        const nextType = type1;
        const nextPoint = point1;

        for (; ;) {
            if (!(type0 | type1)) {
                // both points inside
                clippedLine.push(...point0);
                if (type1 !== nextType) {
                    clippedLine.push(...point1);
                    if (i < line.length - 1) {
                        // break line
                        clippedLines.push(clippedLine);
                        clippedLine = [];
                    }
                } else if (i === line.length - 1) {
                    clippedLine.push(...point1);
                }
                break;
            } else if (type0 & type1) {
                // both points outside
                break;
            } else if (type0) {
                // only point1 inside
                [point0, type0] = intersect(point0, point1, type0);
            } else {
                // only point0 inside
                [point1, type1] = intersect(point0, point1, type1);
            }
        }

        point0 = nextPoint;
        type0 = nextType;
    }

    clippedLine = _removeDuplicatedVerticesOnLine(clippedLine);
    if (clippedLine.length > 0) {
        clippedLines.push(clippedLine);
    }

    return clippedLines;
}

function _removeDuplicatedVerticesOnLine (line) {
    const result = [];
    let prevX;
    let prevY;
    for (let i = 0; i < line.length; i += 2) {
        const x = line[i];
        const y = line[i + 1];
        if (x !== prevX || y !== prevY) {
            result.push(x, y);
            prevX = x;
            prevY = y;
        }
    }
    return result;
}
