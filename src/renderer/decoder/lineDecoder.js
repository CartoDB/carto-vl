import { addLine } from './common';
import { getFloat32ArrayFromArray } from '../../utils/util';

// If the geometry type is 'line' it will generate the appropriate zero-sized, vertex-shader expanded triangle list with `miter` and `bevel` joins.
// The geom will be an array of coordinates in this case

let vertices = new Array(1000000);
let normals = new Array(1000000);

export function decodeLine (geometry) {
    let breakpoints = []; // Array of indices (to vertexArray) that separate each feature
    let featureIDToVertexIndex = new Map();
    let vertexIndex = 0;

    for (let i = 0; i < geometry.length; i++) {
        const feature = geometry[i];
        for (let j = 0; j < feature.length; j++) {
            vertexIndex = addLine(feature[j], vertices, normals, vertexIndex);
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
