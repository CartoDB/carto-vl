import * as earcut from 'earcut';
import { getJointNormal, getLineNormal } from '../utils/geometry';

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
// The geom will be an array of coordinates in this case`
export function decodeGeom (geomType, geom) {
    switch (geomType) {
        case 'point':
            return decodePoint(geom);
        case 'polygon':
            return decodePolygon(geom);
        case 'line':
            return decodeLine(geom);
        default:
            throw new Error(`Unimplemented geometry type: '${geomType}'`);
    }
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

    const geometryLength = geometry.length;

    for (let i = 0; i < geometryLength; i++) {
        const feature = geometry[i];
        const featureLength = feature.length;

        for (let j = 0; j < featureLength; j++) {
            const polygon = feature[j];
            const triangles = earcut(polygon.flat, polygon.holes);
            const trianglesLength = triangles.length;

            for (let k = 0; k < trianglesLength; k++) {
                const index = triangles[k];
                vertices.push(polygon.flat[2 * index], polygon.flat[2 * index + 1]);
                normals.push(0, 0);
            }

            const lineString = polygon.flat;
            const lineStringLength = lineString.length;

            for (let l = 0; l < lineStringLength - 2; l += 2) {
                if (polygon.holes.includes((l + 2) / 2)) {
                    // Skip adding the line which connects two rings
                    continue;
                }

                const a = [lineString[l + 0], lineString[l + 1]];
                const b = [lineString[l + 2], lineString[l + 3]];

                if (isClipped(polygon, l, l + 2)) {
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
        }

        breakpoints.push(vertices.length);
    }

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

    const geometryLength = geometry.length;

    for (let i = 0; i < geometryLength; i++) {
        const feature = geometry[i];
        const featureLength = feature.length;

        for (let j = 0; j < featureLength; j++) {
            const lineString = feature[j];
            const lineStringLength = lineString.length;

            for (let k = 0; k < lineStringLength - 2; k += 2) {
                const a = [lineString[k + 0], lineString[k + 1]];
                const b = [lineString[k + 2], lineString[k + 3]];
                const normal = getLineNormal(b, a);
                let na = normal;
                let nb = normal;

                if (k > 0) {
                    const prev = [lineString[k - 2], lineString[k - 1]];
                    na = getJointNormal(prev, a, b) || na;
                }
                if (k < lineString.length - 4) {
                    const next = [lineString[k + 4], lineString[k + 5]];
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
        }

        breakpoints.push(vertices.length);
    }

    return {
        vertices: new Float32Array(vertices),
        breakpoints,
        normals: new Float32Array(normals)
    };
}

export default { decodeGeom };
