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
const BEVELJOIN = true;


/**
 * Create a triangulated lineString: zero-sized, vertex-shader expanded triangle list
 * with `miter` joins. For angle < 60 joins are automatically adjusted to `bevel`.
 */
function addLine (lineString, vertices, normals) {
    let prevPoint, currentPoint, nextPoint;
    let prevNormal, prevRNormal, prevLNormal;
    let currentNormal, currentRNormal, currentLNormal;
    let nextNormal, nextRNormal, nextLNormal;
    let nextPNormal, nextPRNormal, nextPLNormal;


    // We need at least two points
    if (lineString.length >= 4) {
        // Initialize the first two points
        prevPoint = [lineString[0], lineString[1]];
        currentPoint = [lineString[2], lineString[3]];
        prevLNormal = prevNormal = getLineNormal(prevPoint, currentPoint);
        prevRNormal = neg(prevLNormal);
        currentLNormal = currentNormal = prevNormal;
        currentRNormal = neg(currentLNormal);

        for (let i = 4; i <= lineString.length; i += 2) {
            if (i <= lineString.length - 2) {
                // If there is a next point, compute its properties
                nextPoint = [lineString[i], lineString[i + 1]];
                nextLNormal = nextNormal = getLineNormal(currentPoint, nextPoint);
                nextRNormal = neg(nextLNormal);
                nextPNormal = nextPNormal;
                nextPRNormal = nextPRNormal;
                nextPLNormal = nextPLNormal;
                // currentNormal = currentLNormal = currentRNormal = nextNormal;
                // `turnLeft` indicates that the nextLine turns to the left
                // `joinNormal` contains the direction and size for the `miter` vertex
                //  If this is not defined means that the join must be `bevel`.
                let {turnLeft, joinNormal, miter, longMiter } = getJoinNormal(prevNormal, nextNormal);

                if (NOJOIN) {
                    nextPLNormal = nextLNormal;
                    nextPRNormal = nextRNormal;
                }
                else {

                if (MITERJOIN || (miter && !BEVELJOIN)) {
                    // miter adjustment
                    if (turnLeft) {
                        nextPLNormal = currentLNormal = joinNormal;
                        nextPRNormal = currentRNormal = neg(joinNormal);
                    } else {
                        nextPLNormal = currentLNormal = neg(joinNormal);
                        nextPRNormal = currentRNormal = joinNormal;
                    }

                } else {
                    // bevel
                    // TODO: no joinNormal case
                    if (longMiter) {
                        joinNormal = [0,0]; // turnLeft ? prevLNormal : prevRNormal;
                    }
                    if (turnLeft) {
                        nextPLNormal = joinNormal;
                        nextPRNormal = nextRNormal
                        currentLNormal = joinNormal;
                        currentRNormal = prevRNormal;
                    } else {
                        nextPRNormal = joinNormal;
                        nextPLNormal = nextLNormal;
                        currentLNormal = prevLNormal;
                        currentRNormal = joinNormal;
                    }

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

            // First triangle
            addTriangle(
                [currentPoint, prevPoint, prevPoint],
                [currentRNormal, prevLNormal, prevRNormal]
            );

            // Second triangle
            addTriangle(
                [currentPoint, currentPoint, prevPoint],
                [currentRNormal, currentLNormal, prevLNormal]
            );

            // Update the variables for the next iteration
            prevPoint = currentPoint;
            currentPoint = nextPoint;

            prevNormal = nextNormal;

            prevRNormal = nextPRNormal;
            prevLNormal = nextPLNormal;

            // only for last segment:
            // currentNormal = nextNormal;
            currentLNormal = nextLNormal;
            currentRNormal = nextRNormal;
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
 * multiplied by a factor of `1/sin(theta)` to reach the intersecction of the wide lines.
 * Theta is the angle between the vectors `v` and `u`. But instead of computing the angle,
 * the `sin(theta)` (with sign) is obtained directly from the vectorial product of `v` and `u`
 */
function getJoinNormal (prevNormal, nextNormal) {
    const u = [-prevNormal[1], prevNormal[0]];
    const v = [nextNormal[1], -nextNormal[0]];
    const sin = v[0] * u[1] - v[1] * u[0];
    const cos = v[0] * u[0] + v[1] * u[1];
    console.log(u);
    console.log(v);
    console.log(sin);
    // const sin = v[1] * u[0] - v[0] * u[1];
    const factor = Math.abs(sin);
    const miterJoin = !(factor < 0.866 && cos > 0.5); // 60 deg
    console.log(Math.asin(sin)*180/Math.PI, miterJoin, sin > 0);
    return {
        turnLeft: sin > 0,
        miter: miterJoin,
        longMiter: factor < 1E-12,
        joinNormal: [ // TODO: factor === 0 case (long miter)
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
    const s = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    return [v[0] / s, v[1] / s];
}

export default { decodeGeom };
