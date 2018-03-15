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
    let geometry = [];
    let normals = [];
    let breakpointList = []; // Array of indices (to vertexArray) that separate each feature
    geom.map(feature => {
        feature.map(line => {
            // Create triangulation
            for (let i = 0; i < line.length - 2; i += 2) {
                const a = [line[i + 0], line[i + 1]];
                const b = [line[i + 2], line[i + 3]];
                if (i > 0) {
                    var prev = [line[i + -2], line[i + -1]];
                    var nprev = getLineNormal(a, prev);
                }
                if (i < line.length - 4) {
                    var next = [line[i + 4], line[i + 5]];
                    var nnext = getLineNormal(next, b);
                }
                let normal = getLineNormal(b, a);
                let na = normal;
                let nb = normal;
                //TODO bug, cartesian interpolation is not correct, should use polar coordinates for the interpolation
                if (prev) {
                    na = normalize([
                        normal[0] * 0.5 + nprev[0] * 0.5,
                        normal[1] * 0.5 + nprev[1] * 0.5,
                    ]);
                }
                if (next) {
                    nb = normalize([
                        normal[0] * 0.5 + nnext[0] * 0.5,
                        normal[1] * 0.5 + nnext[1] * 0.5,
                    ]);
                }

                // First triangle
    
                normals.push(-na[0], -na[1]);
                normals.push(na[0], na[1]);
                normals.push(-nb[0], -nb[1]);
    
                geometry.push(a[0], a[1]);
                geometry.push(a[0], a[1]);
                geometry.push(b[0], b[1]);

                //Second triangle
    
                normals.push(na[0], na[1]);
                normals.push(nb[0], nb[1]);
                normals.push(-nb[0], -nb[1]);
    
                geometry.push(a[0], a[1]);
                geometry.push(b[0], b[1]);
                geometry.push(b[0], b[1]);
            }
        });
        breakpointList.push(geometry.length);
    });
    return {
        geometry: new Float32Array(geometry),
        breakpointList,
        normals: new Float32Array(normals)
    };
}

function getLineNormal(a, b) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    return normalize([-dy, dx]);
}

function normalize(v) {
    const s = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    return [v[0] / s, v[1] / s];
}


export default { decodeGeom };
