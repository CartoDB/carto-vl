import * as earcut from 'earcut';
import { getFloat32ArrayFromArray } from '../../utils/util';
import { getLineNormal, neg } from '../../utils/geometry';

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

export function decodePolygon (geometry) {
    let vertices = []; // Array of triangle vertices
    let normals = [];
    let breakpoints = []; // Array of indices (to vertexArray) that separate each feature
    let featureIDToVertexIndex = new Map();
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

                const normal = getLineNormal(b, a);

                if (Number.isNaN(normal[0]) || Number.isNaN(normal[1])) {
                    // Skip when there is no normal vector
                    continue;
                }

                // First triangle
                addTriangle(
                    [a, a, b],
                    [normal, neg(normal), normal]
                );

                // Second triangle
                addTriangle(
                    [a, b, b],
                    [neg(normal), neg(normal), normal]
                );
            }
        }

        featureIDToVertexIndex.set(breakpoints.length, breakpoints.length === 0
            ? { start: 0, end: vertices.length }
            : { start: featureIDToVertexIndex.get(breakpoints.length - 1).end, end: vertices.length });

        breakpoints.push(vertices.length);
    }

    function addTriangle (p, n) {
        vertices.push(
            p[0][0], p[0][1],
            p[1][0], p[1][1],
            p[2][0], p[2][1]
        );
        normals.push(
            n[0][0], n[0][1],
            n[1][0], n[1][1],
            n[2][0], n[2][1]
        );
    }

    return {
        vertices: getFloat32ArrayFromArray(vertices),
        normals: getFloat32ArrayFromArray(normals),
        featureIDToVertexIndex,
        breakpoints
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
