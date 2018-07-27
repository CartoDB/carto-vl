import * as earcut from 'earcut';
import { addLine } from './lineDecoder';
import { getFloat32ArrayFromArray } from '../../utils/util';

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
    let vertices = [];
    let normals = [];
    let breakpoints = [];
    let featureIDToVertexIndex = new Map();

    for (let i = 0; i < geometry.length; i++) {
        const feature = geometry[i];
        for (let j = 0; j < feature.length; j++) {
            const polygon = feature[j];
            const triangles = earcut(polygon.flat, polygon.holes);
            for (let k = 0; k < triangles.length; k++) {
                const index = triangles[k];
                vertices.push(polygon.flat[2 * index], polygon.flat[2 * index + 1]);
                normals.push(0, 0);
            }

            const lineString = polygon.flat;
            addLine(lineString, vertices, normals, (index) => {
                // Skip adding the line which connects two rings OR is clipped
                return polygon.holes.includes((index - 2) / 2) || isClipped(polygon, index - 4, index - 2);
            });
        }

        featureIDToVertexIndex.set(breakpoints.length, breakpoints.length === 0
            ? { start: 0, end: vertices.length }
            : { start: featureIDToVertexIndex.get(breakpoints.length - 1).end, end: vertices.length });

        breakpoints.push(vertices.length);
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
