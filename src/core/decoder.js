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
// If the geometry type is 'line' it will generate the appropriate zero-sized, vertex-shader expanded triangle list with mitter joints.
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

function decodePoint(geometry) {
    return {
        geometry: geometry,
        breakpointList: []
    };
}

function decodePolygon(geometry) {
    let vertexArray = []; //Array of triangle vertices
    let breakpointList = []; // Array of indices (to vertexArray) that separate each feature
    geometry.map(feature => {
        feature.map(polygon => {
            const triangles = earcut(polygon.flat, polygon.holes);
            triangles.map(index => {
                vertexArray.push(polygon.flat[2 * index]);
                vertexArray.push(polygon.flat[2 * index + 1]);
            });
        });
        breakpointList.push(vertexArray.length);
    });
    return {
        geometry: new Float32Array(vertexArray),
        breakpointList
    };
}

function decodeLine(geom) {
    let normals = [];
    let geometry = [];
    let breakpointList = []; // Array of indices (to vertexArray) that separate each feature
    geom.map(feature => {
        feature.map(lineString => {
            // Create triangulation

            // Points a and b are the current points for the line segment
            // to draw. Point c is the next point in the lineString
            let a, b, c;
            // Normal vectors for the lines ab and bc
            let nab, nbc;
            // Normal vectors for the corners zab and abc. We use z to define
            // the point before a.
            let nzab, nabc;
            // Flags that indicate if the corners zab and abc should be flat.
            // The critera for this flag to be true is that the angle of the
            // corner ia less than 30 degrees.
            let fzab = false;
            let fabc = false;
            
            // We need at least two points
            if (lineString.length >= 4) {
                
                // Initialize the first two points
                a = [lineString[0], lineString[1]];
                b = [lineString[2], lineString[3]];
                nab = getLineNormal(a, b);
                
                for (let i = 4; i <= lineString.length; i += 2) {
                    
                    if (i <= lineString.length - 2) {
                        // If there is a next point c, compute its properties
                        c = [lineString[i], lineString[i + 1]];
                        nbc = getLineNormal(b, c);
                        const { flat, normal } = getJointNormal(a, b, c);
                        fabc = flat;
                        nabc = normal;
                    } else {
                        // If there is no next point c, reset its properties
                        fabc = false;
                        nabc = null;
                    }

                    // First triangle
                    geometry.push(a[0], a[1]);
                    geometry.push(a[0], a[1]);
                    geometry.push(b[0], b[1]);
                    nzab ? normals.push(nzab[0], nzab[1]) : normals.push(nab[0], nab[1]);
                    (nzab && !fzab) ? normals.push(-nzab[0], -nzab[1]) : normals.push(-nab[0], -nab[1]);
                    (nabc && !fabc) ? normals.push(-nabc[0], -nabc[1]) : normals.push(-nab[0], -nab[1]);
                    
                    // Second triangle
                    geometry.push(a[0], a[1]);
                    geometry.push(b[0], b[1]);
                    geometry.push(b[0], b[1]);
                    nzab ? normals.push(nzab[0], nzab[1]) : normals.push(nab[0], nab[1]);
                    (nabc && !fabc) ? normals.push(-nabc[0], -nabc[1]) : normals.push(-nab[0], -nab[1]);
                    nabc ? normals.push(nabc[0], nabc[1]) : normals.push(nab[0], nab[1]);
                    
                    if (fabc && nabc) {
                        // Third triangle
                        // It only appears in the flat corners
                        geometry.push(b[0], b[1]);
                        geometry.push(b[0], b[1]);
                        geometry.push(b[0], b[1]);
                        normals.push(nabc[0], nabc[1]);
                        normals.push(-nab[0], -nab[1]);
                        normals.push(-nbc[0], -nbc[1]);
                    }
                    
                    // Update the variables for the next iteration.
                    // This is an algorithm optimization to reduce
                    // the number of operations by half
                    a = b;
                    b = c;
                    nab = nbc;
                    fzab = fabc;
                    nzab = nabc;
                }
            }
        });
        breakpointList.push(geometry.length);
    });
    return {
        normals: new Float32Array(normals),
        geometry: new Float32Array(geometry),
        breakpointList
    };
}

/**
 * Compute the normal of a line AB.
 * By definition it is the unitary vector from A to B, rotated 90 degrees
 */
function getLineNormal(a, b) {
    const u = uvector(a, b);
    return [-u[1], u[0]];
}

/**
 * Compute the normal of the joint of lines BA and BC.
 * By definition this is the sum of the unitary vectors `u` (from B to A) and `v` (from B to C)
 * multiplied by a factor of `1/sin(theta)` to reach the intersecction of the wide lines.
 * Theta is the angle between the vectors `v` and `u`. But instead of computing the angle,
 * the `sin(theta)` (with sign) is obtained directly from the vectorial product of `v` and `u`
 */
function getJointNormal(a, b, c) {
    const u = uvector(b, a);
    const v = uvector(b, c);
    const sin = v[0] * u[1] - v[1] * u[0];
    return {
        flat: Math.abs(sin) < 0.5,
        normal: (sin !== 0) && [(u[0] + v[0]) / sin, (u[1] + v[1]) / sin]
    };
}

/**
 * Create a unitary vector wich goes from p1 to p2
 */
function uvector(p1, p2) {
    return normalize([p2[0] - p1[0], p2[1] - p1[1]]);
}

/**
 * Return the vector scaled to length 1
 */
function normalize(v) {
    const s = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    return [v[0] / s, v[1] / s];
}

export default { decodeGeom };
