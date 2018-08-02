import * as earcut from 'earcut';
import { addLine } from './common';
import { getFloat32ArrayFromArray } from '../../utils/util';

// If the geometry type is 'polygon' it will triangulate the polygon list (geom)
// geom will be a list of polygons in which each polygon will have a flat array of vertices and a list of holes indices
// Example:
/*   let geom = [{
       flat: [
         0.,0., 1.,0., 1.,1., 0.,1., 0.,0, //A square
         0.25,0.25, 0.75,0.25, 0.75,0.75, 0.25,0.75, 0.25,0.25//A small square
       ]
       holes: [5]
     }]
*/

let vertices = new Array(2000000);
let normals = new Array(2000000);

export function decodePolygon (geometry) {
    let breakpoints = []; // Array of indices (to vertexArray) that separate each feature
    let featureIDToVertexIndex = new Map();
    let vertexIndex = 0;

    for (let i = 0; i < geometry.length; i++) {
        const feature = geometry[i];
        for (let j = 0; j < feature.length; j++) {
            const polygon = feature[j];
            const triangles = earcut(polygon.flat, polygon.holes);
            for (let k = 0; k < triangles.length; k++) {
                const index = triangles[k];
                vertices[vertexIndex] = polygon.flat[2 * index];
                normals[vertexIndex++] = 0;
                vertices[vertexIndex] = polygon.flat[2 * index + 1];
                normals[vertexIndex++] = 0;
                // vertices.push(polygon.flat[2 * index], polygon.flat[2 * index + 1]);
                // normals.push(0, 0);
            }

            vertexIndex = addLine(polygon.flat, vertices, normals, vertexIndex, true, (index) => {
                // Skip adding the line which connects two rings OR is clipped
                return polygon.holes.includes((index - 2) / 2) || isClipped(polygon, index - 4, index - 2);
            });
        }

        featureIDToVertexIndex.set(breakpoints.length, breakpoints.length === 0
            ? { start: 0, end: vertexIndex }
            : { start: featureIDToVertexIndex.get(breakpoints.length - 1).end, end: vertexIndex });

        breakpoints.push(vertexIndex);
    }

    return {
        vertices: getFloat32ArrayFromArray(vertices, vertexIndex),
        normals: getFloat32ArrayFromArray(normals, vertexIndex),
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
