import * as earcut from 'earcut';
import { addLineString, resizeBuffer } from './common';

// If the geometry type is GEOMETRY_TYPE.POLYGON it will triangulate the polygon list (geom)
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

const STATIC_INITIAL_BUFFER_SIZE = 1024 * 1024 * 2; // 8 MB
const VERTEX_COORDINATES_PER_TRIANGLE = 2;
const MAX_VERTICES_COORDINATES_PER_SEGMENT = 24;

let index = 0;
let geomBuffer = {
    vertices: new Float32Array(STATIC_INITIAL_BUFFER_SIZE),
    normals: new Float32Array(STATIC_INITIAL_BUFFER_SIZE)
};

export function decodePolygon (geometry) {
    let breakpoints = []; // Array of indices (to vertexArray) that separate each feature
    let featureIDToVertexIndex = new Map();

    index = 0;
    for (let i = 0; i < geometry.length; i++) {
        const feature = geometry[i];
        for (let j = 0; j < feature.length; j++) {
            const polygon = feature[j];
            const triangles = earcut(polygon.flat, polygon.holes);

            // Increase buffers size if required
            resizeBuffers(VERTEX_COORDINATES_PER_TRIANGLE * triangles.length +
                MAX_VERTICES_COORDINATES_PER_SEGMENT * polygon.flat.length);

            // Add polygon
            for (let k = 0; k < triangles.length; k++) {
                addVertex(polygon.flat, 2 * triangles[k]);
            }

            // Add polygon stroke
            index = addLineString(polygon.flat, geomBuffer, index, true, (pointIndex) => {
                // Skip adding the line which connects two rings OR is clipped
                return polygon.holes.includes((pointIndex - 2) / 2) || isClipped(polygon, pointIndex - 4, pointIndex - 2);
            });
        }

        featureIDToVertexIndex.set(breakpoints.length, breakpoints.length === 0
            ? { start: 0, end: index }
            : { start: featureIDToVertexIndex.get(breakpoints.length - 1).end, end: index });

        breakpoints.push(index);
    }

    const verticesArrayBuffer = new ArrayBuffer(4 * index);
    const normalsArrayBuffer = new ArrayBuffer(4 * index);
    const vertices = new Float32Array(verticesArrayBuffer);
    const normals = new Float32Array(normalsArrayBuffer);
    for (let i = 0; i < index; i++) {
        vertices[i] = geomBuffer.vertices[i];
        normals[i] = geomBuffer.normals[i];
    }
    return {
        vertices,
        normals,
        verticesArrayBuffer,
        normalsArrayBuffer,
        featureIDToVertexIndex,
        breakpoints
    };
}

// Resize buffers as needed if `additionalSize` floats overflow the current buffers
function resizeBuffers (additionalSize) {
    const minimumNeededSize = index + additionalSize;
    if (minimumNeededSize > geomBuffer.vertices.length) {
        const newSize = 2 * minimumNeededSize;
        geomBuffer.vertices = resizeBuffer(geomBuffer.vertices, newSize);
        geomBuffer.normals = resizeBuffer(geomBuffer.normals, newSize);
    }
}

// Add vertex in triangles.
function addVertex (array, vertexIndex) {
    geomBuffer.vertices[index] = array[vertexIndex];
    geomBuffer.normals[index++] = 0;
    geomBuffer.vertices[index] = array[vertexIndex + 1];
    geomBuffer.normals[index++] = 0;
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
