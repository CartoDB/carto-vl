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
export function decodeGeom(geomType, geom) {
    if (geomType == 'point') {
        return decodePoint(geom);
    }
    if (geomType == 'polygon') {
        return decodePolygon(geom);
    }
    if (geomType == 'line') {
        return decodeLine(geom);
    }
    throw new Error(`Unimplemented geometry type: '${geomType}'`);
}

function decodePoint(vertices) {
    return {
        vertices: vertices,
        breakpoints: []
    };
}

function decodePolygon(geometry) {
    let vertices = []; //Array of triangle vertices
    let breakpoints = []; // Array of indices (to vertexArray) that separate each feature
    geometry.map(feature => {
        feature.map(polygon => {
            const triangles = earcut(polygon.flat, polygon.holes);
            triangles.map(index => {
                vertices.push(polygon.flat[2 * index]);
                vertices.push(polygon.flat[2 * index + 1]);
            });
        });
        breakpoints.push(vertices.length);
    });
    return {
        vertices: new Float32Array(vertices),
        breakpoints
    };
}

function decodeLine(geom) {
    let vertices = [];
    let normals = [];
    let breakpoints = []; // Array of indices (to vertexArray) that separate each feature
    geom.map(feature => {
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

/**
 * Create a triangulated lineString: zero-sized, vertex-shader expanded triangle list
 * with `miter` joins. For angle < 60 joins are automatically adjusted to `bevel`.
 */
function addLine(lineString, vertices, normals) {
    let prevPoint, currentPoint, nextPoint;
    let prevNormal, nextNormal;
    
    // We need at least two points
    if (lineString.length >= 4) {
        
        // Initialize the first two points
        prevPoint = [lineString[0], lineString[1]];
        currentPoint = [lineString[2], lineString[3]];
        prevNormal = getLineNormal(prevPoint, currentPoint);
        
        for (let i = 4; i <= lineString.length; i += 2) {
            
            // First triangle
            addTriangle(
                [prevPoint, prevPoint, currentPoint],
                [neg(prevNormal), prevNormal, prevNormal]
            );
            
            // Second triangle
            addTriangle(
                [prevPoint, currentPoint, currentPoint],
                [neg(prevNormal), prevNormal, neg(prevNormal)]
            );
            
            if (i <= lineString.length - 2) {
                // If there is a next point, compute its properties
                nextPoint = [lineString[i], lineString[i + 1]];
                nextNormal = getLineNormal(currentPoint, nextPoint);
                // `turnLeft` indicates that the nextLine turns to the left
                // `joinNormal` contains the direction and size for the `miter` vertex
                //  If this is not defined means that the join must be `bevel`.
                let {turnLeft, joinNormal} = getJoinNormal(prevNormal, nextNormal);
                
                // Third triangle
                addTriangle(
                    [currentPoint, currentPoint, currentPoint],
                    [[0, 0],
                        turnLeft ? prevNormal : neg(nextNormal),
                        turnLeft ? nextNormal : neg(prevNormal)]
                );
                
                if (joinNormal) {
                    // Forth triangle
                    addTriangle(
                        [currentPoint, currentPoint, currentPoint],
                        [joinNormal,
                            turnLeft ? nextNormal : neg(prevNormal),
                            turnLeft ? prevNormal : neg(nextNormal)]
                    );   
                }
            }
            
            // Update the variables for the next iteration
            prevPoint = currentPoint;
            currentPoint = nextPoint;
            prevNormal = nextNormal;
        }
    }

    function addTriangle(p, n) {
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
 * By definition it is the unitary vector from B to A, rotated +90 degrees
 */
function getLineNormal(a, b) {
    const u = normalize(vector(b, a));
    return [-u[1], u[0]];
}

/**
 * Compute the normal of the join from the lines' normals.
 * By definition this is the sum of the unitary vectors `u` (from B to A) and `v` (from B to C)
 * multiplied by a factor of `1/sin(theta)` to reach the intersecction of the wide lines.
 * Theta is the angle between the vectors `v` and `u`. But instead of computing the angle,
 * the `sin(theta)` (with sign) is obtained directly from the vectorial product of `v` and `u`
 */
function getJoinNormal(prevNormal, nextNormal) {
    const u = [prevNormal[1], -prevNormal[0]];
    const v = [-nextNormal[1], nextNormal[0]];
    const sin = v[0] * u[1] - v[1] * u[0];
    const factor = Math.abs(sin);
    const miterJoin = factor > 0.866; // 60 deg
    return {
        turnLeft: sin > 0,
        joinNormal: miterJoin && neg([
            (u[0] + v[0]) / factor ,
            (u[1] + v[1]) / factor
        ])
    };
}

/**
 * Return the negative of the provided vector
 */
function neg(v) {
    return [-v[0], -v[1]];
}

/**
 * Create a vector which goes from p1 to p2
 */
function vector(p1, p2) {
    return [p2[0] - p1[0], p2[1] - p1[1]];
}

/**
 * Return the vector scaled to length 1
 */
function normalize(v) {
    const s = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    return [v[0] / s, v[1] / s];
}

export default { decodeGeom };
