import { addLineString, resizeBuffer } from './common';

// If the geometry type is 'line' it will generate the appropriate zero-sized, vertex-shader expanded triangle list with `miter` and `bevel` joins.
// The geom will be an array of coordinates in this case

const STATIC_INITIAL_BUFFER_SIZE = 1024 * 1024; // 4 MB
const MAX_VERTICES_COORDINATES_PER_SEGMENT = 24;

let index = 0;
let geomBuffer = {
    vertices: new Float32Array(STATIC_INITIAL_BUFFER_SIZE),
    normals: new Float32Array(STATIC_INITIAL_BUFFER_SIZE)
};

export function decodeLine (geometry, options) {
    let breakpoints = []; // Array of indices (to vertexArray) that separate each feature
    let featureIDToVertexIndex = new Map();

    index = 0;
    for (let i = 0; i < geometry.length; i++) {
        const feature = geometry[i];
        for (let j = 0; j < feature.length; j++) {
            // Increase buffers size if required
            resizeBuffers(MAX_VERTICES_COORDINATES_PER_SEGMENT * feature[j].length);

            // Add line string
            index = addLineString(feature[j], geomBuffer, index, options);
        }

        featureIDToVertexIndex.set(breakpoints.length, breakpoints.length === 0
            ? { start: 0, end: index }
            : { start: featureIDToVertexIndex.get(breakpoints.length - 1).end, end: index });

        breakpoints.push(index);
    }

    return {
        vertices: geomBuffer.vertices.slice(0, index),
        normals: geomBuffer.normals.slice(0, index),
        featureIDToVertexIndex,
        breakpoints
    };
}

// Resize buffers as needed if `additionalSize` floats overflow the current buffers.
function resizeBuffers (additionalSize) {
    const minimumNeededSize = index + additionalSize;
    if (minimumNeededSize > geomBuffer.vertices.length) {
        const newSize = 2 * minimumNeededSize;
        geomBuffer.vertices = resizeBuffer(geomBuffer.vertices, newSize);
        geomBuffer.normals = resizeBuffer(geomBuffer.normals, newSize);
    }
}
