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
    window.CARTO_VL_PPROF && console.time('decodepolygon-decode');
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
                normals.push(na[0], na[1]);
                normals.push(-nb[0], -nb[1]);

                vertices.push(a[0], a[1]);
                vertices.push(a[0], a[1]);
                vertices.push(b[0], b[1]);

                // Second triangle

                normals.push(na[0], na[1]);
                normals.push(nb[0], nb[1]);
                normals.push(-nb[0], -nb[1]);

                vertices.push(a[0], a[1]);
                vertices.push(b[0], b[1]);
                vertices.push(b[0], b[1]);
            }
        });
        breakpoints.push(vertices.length);
    });
    window.CARTO_VL_PPROF && console.timeEnd('decodepolygon-decode');
    window.CARTO_VL_PPROF && console.time('decodepolygon-f32');
    const vertices32 = get32(vertices);
    const normals32 = get32(normals);
    window.CARTO_VL_PPROF && console.timeEnd('decodepolygon-f32');
    // console.time('decodepolygon3');
    const obj = {
        vertices: vertices32,
        breakpoints,
        normals: normals32
    };
    // console.timeEnd('decodepolygon3');
    return obj;
}

function get32 (array) {
    if (window.CARTO_VL_FIX_F32) {
        // Workaround path
        const length = array.length;
        const array32 = new Float32Array(length);
        for (let i = 0; i < length; i++) {
            array32[i] = array[i];
        }
        return array32;
    } else {
        // Original path
        return new Float32Array(array);
    }
}

function decodeLine (geom) {
    let vertices = [];
    let normals = [];
    let breakpoints = []; // Array of indices (to vertexArray) that separate each feature
    geom.map(feature => {
        feature.map(lineString => {
            // Create triangulation

            for (let i = 0; i < lineString.length - 2; i += 2) {
                const a = [lineString[i + 0], lineString[i + 1]];
                const b = [lineString[i + 2], lineString[i + 3]];
                const normal = getLineNormal(b, a);
                let na = normal;
                let nb = normal;

                if (i > 0) {
                    const prev = [lineString[i - 2], lineString[i - 1]];
                    na = getJointNormal(prev, a, b) || na;
                }
                if (i < lineString.length - 4) {
                    const next = [lineString[i + 4], lineString[i + 5]];
                    nb = getJointNormal(a, b, next) || nb;
                }

                // First triangle

                normals.push(-na[0], -na[1]);
                normals.push(na[0], na[1]);
                normals.push(-nb[0], -nb[1]);

                vertices.push(a[0], a[1]);
                vertices.push(a[0], a[1]);
                vertices.push(b[0], b[1]);

                // Second triangle

                normals.push(na[0], na[1]);
                normals.push(nb[0], nb[1]);
                normals.push(-nb[0], -nb[1]);

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

function getLineNormal (a, b) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    return normalize([-dy, dx]);
}

function getJointNormal (a, b, c) {
    const u = normalize([a[0] - b[0], a[1] - b[1]]);
    const v = normalize([c[0] - b[0], c[1] - b[1]]);
    const sin = -u[1] * v[0] + u[0] * v[1];
    if (sin !== 0) {
        return [(u[0] + v[0]) / sin, (u[1] + v[1]) / sin];
    }
}

function normalize (v) {
    const s = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    return [v[0] / s, v[1] / s];
}

export default { decodeGeom };
