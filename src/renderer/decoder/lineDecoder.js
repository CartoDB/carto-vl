import { addLine } from './common';
import { getFloat32ArrayFromArray } from '../../utils/util';

// If the geometry type is 'line' it will generate the appropriate zero-sized, vertex-shader expanded triangle list with `miter` and `bevel` joins.
// The geom will be an array of coordinates in this case

export function decodeLine (geometry) {
    let vertices = [];
    let normals = [];
    let breakpoints = [];
    let featureIDToVertexIndex = new Map();

    for (let i = 0; i < geometry.length; i++) {
        const feature = geometry[i];
        for (let j = 0; j < feature.length; j++) {
            const lineString = feature[j];
            addLine(lineString, vertices, normals);
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
