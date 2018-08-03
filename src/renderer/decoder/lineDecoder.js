import { addLineString } from './common';

// If the geometry type is 'line' it will generate the appropriate zero-sized, vertex-shader expanded triangle list with `miter` and `bevel` joins.
// The geom will be an array of coordinates in this case

const geomBuffer = {
    index: 0,
    vertices: new Float32Array(1000000),
    normals: new Float32Array(1000000)
};

export function decodeLine (geometry) {
    let breakpoints = []; // Array of indices (to vertexArray) that separate each feature
    let featureIDToVertexIndex = new Map();

    geomBuffer.index = 0;
    for (let i = 0; i < geometry.length; i++) {
        const feature = geometry[i];
        for (let j = 0; j < feature.length; j++) {
            addLineString(feature[j], geomBuffer);
        }

        featureIDToVertexIndex.set(breakpoints.length, breakpoints.length === 0
            ? { start: 0, end: geomBuffer.index }
            : { start: featureIDToVertexIndex.get(breakpoints.length - 1).end, end: geomBuffer.index });

        breakpoints.push(geomBuffer.index);
    }

    return {
        vertices: new Float32Array(geomBuffer.vertices.slice(0, geomBuffer.index)),
        normals: new Float32Array(geomBuffer.normals.slice(0, geomBuffer.index)),
        featureIDToVertexIndex,
        breakpoints
    };
}
