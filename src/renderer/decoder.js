import * as earcut from 'earcut';

// Decode a tile geometry
// If the geometry type is 'point' it will pass trough the geom (the vertex array)
// If the geometry type is 'polygon' it will triangulate the polygon list (geom)
//      geom will be a list of polygons in which each polygon will have a flat array of vertices and a list of holes indices
//      Example:
/*         let geom = [
                {
                    flat: [
                        0.,0., 1.,0., 1.,1., 0.,1., 0.,0, //A square
                        0.25,0.25, 0.75,0.25, 0.75,0.75, 0.25,0.75, 0.25,0.25//A small square
                    ]
                    holes: [5]
                }
            ]
*/
// If the geometry type is 'line' it will generate the appropriate zero-sized, vertex-shader expanded triangle list with `miter` and `bevel` joins.
// The geom will be an array of coordinates in this case
export function decodeGeom (geomType, geom) {
    if (geomType === 'point') {
        return decodePoint(geom);
    }
    if (geomType === 'polygon') {
        return decodePolygon(geom);
    }
    if (geomType === 'line') {
        return decodeLine(geom);
    }
    throw new Error(`Unimplemented geometry type: '${geomType}'`);
}

function decodePoint (vertices) {
    return {
        vertices: vertices,
        breakpoints: []
    };
}

function isClipped (polygon, i, j) {
    if (polygon.clipped.includes(i) && polygon.clipped.includes(j)) {
        if (polygon.clippedType[polygon.clipped.indexOf(i)] &
            polygon.clippedType[polygon.clipped.indexOf(j)]) {
            return true;
        }
    }
    return false;
}

function decodePolygon (geometry) {
    let vertices = []; // Array of triangle vertices
    let normals = [];
    let breakpoints = []; // Array of indices (to vertexArray) that separate each feature
    geometry.forEach(feature => {
        feature.forEach(polygon => {
            const triangles = earcut(polygon.flat, polygon.holes);
            const trianglesLength = triangles.length;
            for (let i = 0; i < trianglesLength; i++) {
                const index = triangles[i];
                vertices.push(polygon.flat[2 * index], polygon.flat[2 * index + 1]);
                normals.push(0, 0);
            }

            const lineString = polygon.flat;
            for (let i = 0; i < lineString.length - 2; i += 2) {
                if (polygon.holes.includes((i + 2) / 2)) {
                    // Skip adding the line which connects two rings
                    continue;
                }

                const a = [lineString[i + 0], lineString[i + 1]];
                const b = [lineString[i + 2], lineString[i + 3]];

                if (isClipped(polygon, i, i + 2)) {
                    continue;
                }

                let normal = getLineNormal(b, a);

                if (isNaN(normal[0]) || isNaN(normal[1])) {
                    // Skip when there is no normal vector
                    continue;
                }

                let na = normal;
                let nb = normal;

                // First triangle

                normals.push(-na[0], -na[1]);
                normals.push(-nb[0], -nb[1]);
                normals.push(na[0], na[1]);

                vertices.push(a[0], a[1]);
                vertices.push(b[0], b[1]);
                vertices.push(a[0], a[1]);

                // Second triangle

                normals.push(na[0], na[1]);
                normals.push(-nb[0], -nb[1]);
                normals.push(nb[0], nb[1]);

                vertices.push(a[0], a[1]);
                vertices.push(b[0], b[1]);
                vertices.push(b[0], b[1]);
            }
        });
        breakpoints.push(vertices.length);
    });
    return {
        vertices: new Float32Array(vertices),
        breakpoints,
        normals: new Float32Array(normals)
    };
}

function decodeLine (geometry) {
    let vertices = [];
    let normals = [];
    let breakpoints = []; // Array of indices (to vertexArray) that separate each feature
    geometry.map(feature => {
        feature.map(lineString => {
            addLine(lineString, vertices, normals);
        });
        breakpoints.push(vertices.length);
    });
    return {
        normals: new Float32Array(normals),
        vertices: new Float32Array(vertices),
        breakpoints
    };
}

const NOJOIN = false;
const MITERJOIN = false;
const BEVELJOIN = false;


/**
 * Create a triangulated lineString: zero-sized, vertex-shader expanded triangle list
 * with `miter` joins. For angle < 60 joins are automatically adjusted to `bevel`.
 */
function addLine (lineString, vertices, normals) {
    // At joins we have:
    // prevPoint, currentPoint, nextPoint
    // with the previous segment from prevPoint to currentPoint and the next one from currentPoint to nextPoint
    // we keep track of:
    // prevNormal: normal to previous segment (to the left)
    // prevLeft: adjusted position of left triangle vertex at prevPoint (previous segment)
    // prevRight: adjusted position of right triangle vertex at prevPoint (previous segment)
    // currentLeft: adjusted position of left triangle vertex at currentPoint (previous segment)
    // currentRight: adjusted position of right triangle vertex at currentPoint (previous segment)
    // nextNormal: normal to next segment (to the left)
    // nextLeft, nextRight are the values of prevLeft, prevRight for the next iteration
    // (i.e. the adjusted points for the next segment triangles)
    // currentLeft, curentRight are used
    let prevPoint, currentPoint, nextPoint;
    let prevNormal, prevRight, prevLeft;
    let currentRight, currentLeft;
    let nextNormal, nextRight, nextLeft;

    // We need at least two points
    if (lineString.length >= 4) {
        // Initialize the first two points
        prevPoint = [lineString[0], lineString[1]];
        currentPoint = [lineString[2], lineString[3]];
        prevLeft = prevNormal = getLineNormal(prevPoint, currentPoint);
        prevRight = neg(prevLeft);
        currentLeft = prevNormal;
        currentRight = neg(currentLeft);

        for (let i = 4; i <= lineString.length; i += 2) {
            if (i <= lineString.length - 2) {
                // If there is a next point, compute its properties
                nextPoint = [lineString[i], lineString[i + 1]];
                nextNormal = getLineNormal(currentPoint, nextPoint);

                // `turnLeft` indicates that the nextLine turns to the left
                // `joinNormal` contains the direction and size for the `miter` vertex
                //  `miter` indicates that the join must be `miter`, not `bevel`.
                let {turnLeft, joinNormal, miter } = getJoinNormal(prevNormal, nextNormal);

                if (NOJOIN || !joinNormal) {
                    nextLeft = nextNormal;
                    nextRight = neg(nextNormal);
                }
                else {

                if (MITERJOIN || (miter && !BEVELJOIN)) {
                    // Miter join: adjust left/right vertices
                    if (turnLeft) {
                        nextLeft = currentLeft = joinNormal;
                        nextRight = currentRight = neg(joinNormal);
                    } else {
                        nextLeft = currentLeft = neg(joinNormal);
                        nextRight = currentRight = joinNormal;
                    }

                } else {
                    // Bevel join: adjust vertices and produce bevel triangle
                    const joinLength = length(joinNormal);
                    const segmentLength = Math.min(
                        length(vector(prevPoint, currentPoint)),
                        length(vector(currentPoint, nextPoint))
                    );

                    if (joinLength > segmentLength) {
                        // This is a coarse adjustment for problematic large join normals
                        joinNormal = [joinNormal[0]*segmentLength/joinLength, joinNormal[1]*segmentLength/joinLength];
                    }

                    if (turnLeft) {
                        nextLeft = joinNormal;
                        nextRight = neg(nextNormal);
                        currentLeft = joinNormal;
                        currentRight = neg(prevNormal);
                    } else {
                        nextRight = joinNormal;
                        nextLeft = nextNormal;
                        currentLeft = prevNormal;
                        currentRight = joinNormal;
                    }

                    // Bevel triangle
                    addTriangle(
                        [currentPoint, currentPoint, currentPoint],
                        [joinNormal,
                            turnLeft ? neg(prevNormal) : nextNormal,
                            turnLeft ? neg(nextNormal) : prevNormal
                            ]
                    );
                }

                }; // NOJOIN
            }

            // Segment from prevPoint to currentPoint triangles
            // First triangle
            addTriangle(
                [currentPoint, prevPoint, prevPoint],
                [currentRight, prevLeft, prevRight]
            );

            // Second triangle
            addTriangle(
                [currentPoint, currentPoint, prevPoint],
                [currentRight, currentLeft, prevLeft]
            );

            // Update the variables for the next iteration
            prevPoint = currentPoint;
            currentPoint = nextPoint;

            prevNormal = nextNormal;

            prevRight = nextRight;
            prevLeft = nextLeft;

            if (nextNormal) {
                currentLeft = nextNormal;
                currentRight = neg(nextNormal);
            }
        }
    }

    function addTriangle (p, n) {
        vertices.push(p[0][0], p[0][1]);
        vertices.push(p[1][0], p[1][1]);
        vertices.push(p[2][0], p[2][1]);
        normals.push(n[0][0], n[0][1]);
        normals.push(n[1][0], n[1][1]);
        normals.push(n[2][0], n[2][1]);
    }
}

/**
 * Compute the normal of a line AB.
 * By definition it is the unitary vector from A to B, rotated +90 degrees counter-clockwise
 */
function getLineNormal (a, b) {
    const u = normalize(vector(a, b));
    return [-u[1], u[0]]
}

/**
 * Compute the normal of the join from the lines' normals.
 * By definition this is the sum of the unitary vectors `u` (from B to A) and `v` (from B to C)
 * multiplied by a factor of `1/sin(theta)` to reach the intersection of the wide lines.
 * Theta is the angle between the vectors `v` and `u`. But instead of computing the angle,
 * the `sin(theta)` (with sign) is obtained directly from the vectorial product of `v` and `u`
 */
function getJoinNormal (prevNormal, nextNormal) {
    const u = [-prevNormal[1], prevNormal[0]];
    const v = [nextNormal[1], -nextNormal[0]];
    const sin = v[0] * u[1] - v[1] * u[0];
    const cos = v[0] * u[0] + v[1] * u[1];
    const factor = Math.abs(sin);
    const miterJoin = !(factor < 0.866 && cos > 0.5); // 60 deg
    return {
        turnLeft: sin > 0,
        miter: miterJoin,
        joinNormal: (factor !== 0) && [
            (u[0] + v[0]) / factor, // TODO sin => join not always inner but R
            (u[1] + v[1]) / factor
        ]
    };
}

/**
 * Return the negative of the provided vector
 */
function neg (v) {
    return [-v[0], -v[1]];
}

/**
 * Create a vector which goes from p1 to p2
 */
function vector (p1, p2) {
    return [p2[0] - p1[0], p2[1] - p1[1]];
}

/**
 * Return the vector scaled to length 1
 */
function normalize (v) {
    const s = length(v);
    return [v[0] / s, v[1] / s];
}

function length (v) {
    return Math.hypot(v[0], v[1]);
}

export default { decodeGeom };
