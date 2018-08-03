import { addLineString } from './common';

// If the geometry type is 'line' it will generate the appropriate zero-sized, vertex-shader expanded triangle list with `miter` and `bevel` joins.
// The geom will be an array of coordinates in this case

const MAX_VERTICES_PER_SEGMENT = 24;

export function decodeLine (geometry, geomBuffer) {
    let breakpoints = []; // Array of indices (to vertexArray) that separate each feature
    let featureIDToVertexIndex = new Map();

    let numberFeatures = 0;
    for (let i = 0; i < geometry.length; i++) {
        numberFeatures += geometry[i].length;
    }
    let numberVertices = MAX_VERTICES_PER_SEGMENT * numberFeatures;
    if (geomBuffer.vertices.length < numberVertices) {
        // Resize the buffers
        console.log('RESIZE', numberVertices);
        geomBuffer.vertices = new Float32Array(numberVertices);
        geomBuffer.normals = new Float32Array(numberVertices);
    }

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
