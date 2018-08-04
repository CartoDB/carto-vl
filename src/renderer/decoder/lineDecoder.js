import { addLineString } from './common';

// If the geometry type is 'line' it will generate the appropriate zero-sized, vertex-shader expanded triangle list with `miter` and `bevel` joins.
// The geom will be an array of coordinates in this case

const STATIC_INITIAL_BUFFER_SIZE = 1024 * 1024; // 4 MB
const geomBuffer = {
    vertices: new Float32Array(STATIC_INITIAL_BUFFER_SIZE),
    normals: new Float32Array(STATIC_INITIAL_BUFFER_SIZE)
};

let geomBufferindex = 0;

// Resize `geomBuffer` as needed if `additionalSize` floats overflow the current buffers
function _realloc (additionalSize) {
    const minimumNeededSize = geomBufferindex + additionalSize;
    if (minimumNeededSize > geomBuffer.vertices.length) {
        console.log('RESIZE', minimumNeededSize, geomBuffer.vertices.length);
        // Buffer overflow
        const newSize = 2 * minimumNeededSize;
        geomBuffer.vertices = _resizeBuffer(geomBuffer.vertices, newSize);
        geomBuffer.normals = _resizeBuffer(geomBuffer.normals, newSize);
    }
}
function _resizeBuffer (oldBuffer, newSize) {
    const newBuffer = new Float32Array(newSize);
    // Copy values from the previous buffer
    for (let i = 0; i < oldBuffer.length; i++) {
        newBuffer[i] = oldBuffer[i];
    }
    return newBuffer;
}

export function decodeLine (geometry) {
    let breakpoints = []; // Array of indices (to vertexArray) that separate each feature
    let featureIDToVertexIndex = new Map();

    geomBufferindex = 0;
    for (let i = 0; i < geometry.length; i++) {
        const feature = geometry[i];
        for (let j = 0; j < feature.length; j++) {
            geomBufferindex = addLineString(feature[j], geomBuffer, geomBufferindex, false, false, _realloc);
        }

        featureIDToVertexIndex.set(breakpoints.length, breakpoints.length === 0
            ? { start: 0, end: geomBufferindex }
            : { start: featureIDToVertexIndex.get(breakpoints.length - 1).end, end: geomBufferindex });

        breakpoints.push(geomBufferindex);
    }

    return {
        vertices: geomBuffer.vertices.slice(0, geomBufferindex),
        normals: geomBuffer.normals.slice(0, geomBufferindex),
        featureIDToVertexIndex,
        breakpoints
    };
}
