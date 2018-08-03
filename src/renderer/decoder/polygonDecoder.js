import * as earcut from 'earcut';
import { addLineString } from './common';

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

const STATIC_INITIAL_BUFFER_SIZE = 1024 * 1024 / 4; // 1 MB
const geomBuffer = {
    index: 0,
    vertices: new Float32Array(STATIC_INITIAL_BUFFER_SIZE),
    normals: new Float32Array(STATIC_INITIAL_BUFFER_SIZE)
};

// Resize `geomBuffer` as needed if `additionalSize` floats overflow the current buffers
function _realloc (additionalSize) {
    const minimumNeededSize = geomBuffer.index + additionalSize;
    if (minimumNeededSize > geomBuffer.vertices.length) {
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

export function decodePolygon (geometry) {
    let breakpoints = []; // Array of indices (to vertexArray) that separate each feature
    let featureIDToVertexIndex = new Map();

    geomBuffer.index = 0;
    for (let i = 0; i < geometry.length; i++) {
        const feature = geometry[i];
        for (let j = 0; j < feature.length; j++) {
            const polygon = feature[j];
            const triangles = earcut(polygon.flat, polygon.holes);
            _realloc(2 * triangles.length);
            for (let k = 0; k < triangles.length; k++) {
                addVertex(polygon.flat, 2 * triangles[k], geomBuffer);
            }

            addLineString(polygon.flat, geomBuffer, true, (index) => {
                // Skip adding the line which connects two rings OR is clipped
                return polygon.holes.includes((index - 2) / 2) || isClipped(polygon, index - 4, index - 2);
            }, _realloc);
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

function addVertex (array, index, geomBuffer) {
    geomBuffer.vertices[geomBuffer.index] = array[index];
    geomBuffer.normals[geomBuffer.index++] = 0;
    geomBuffer.vertices[geomBuffer.index] = array[index + 1];
    geomBuffer.normals[geomBuffer.index++] = 0;
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
