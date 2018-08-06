import * as earcut from 'earcut';
import { addLineString, resizeBuffer } from './common';

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

const STATIC_INITIAL_BUFFER_SIZE = 1024 * 1024; // 4 MB
const geomBuffer = {
    vertices: new Float32Array(STATIC_INITIAL_BUFFER_SIZE),
    normals: new Float32Array(STATIC_INITIAL_BUFFER_SIZE)
};

let geomBufferindex = 0;

export function decodePolygon (geometry) {
    let breakpoints = []; // Array of indices (to vertexArray) that separate each feature
    let featureIDToVertexIndex = new Map();

    geomBufferindex = 0;
    for (let i = 0; i < geometry.length; i++) {
        const feature = geometry[i];
        for (let j = 0; j < feature.length; j++) {
            const polygon = feature[j];
            const triangles = earcut(polygon.flat, polygon.holes);
            _realloc(2 * triangles.length + 24 * polygon.flat.length);
            for (let k = 0; k < triangles.length; k++) {
                geomBufferindex = addVertex(polygon.flat, 2 * triangles[k], geomBuffer, geomBufferindex);
            }

            geomBufferindex = addLineString(polygon.flat, geomBuffer, geomBufferindex, true, (index) => {
                // Skip adding the line which connects two rings OR is clipped
                return polygon.holes.includes((index - 2) / 2) || isClipped(polygon, index - 4, index - 2);
            });
        }

        featureIDToVertexIndex.set(breakpoints.length, breakpoints.length === 0
            ? { start: 0, end: geomBufferindex }
            : { start: featureIDToVertexIndex.get(breakpoints.length - 1).end, end: geomBufferindex });

        breakpoints.push(geomBufferindex);
    }

    // console.log(geomBufferindex);

    return {
        vertices: geomBuffer.vertices.subarray(0, geomBufferindex),
        normals: geomBuffer.normals.subarray(0, geomBufferindex),
        featureIDToVertexIndex,
        breakpoints
    };
}

// Resize `geomBuffer` as needed if `additionalSize` floats overflow the current buffers
function _realloc (additionalSize) {
    const minimumNeededSize = geomBufferindex + additionalSize;
    if (minimumNeededSize > geomBuffer.vertices.length) {
        console.log('RESIZE', minimumNeededSize, geomBuffer.vertices.length);
        // Buffer overflow
        const newSize = 2 * minimumNeededSize;
        geomBuffer.vertices = resizeBuffer(geomBuffer.vertices, newSize);
        geomBuffer.normals = resizeBuffer(geomBuffer.normals, newSize);
    }
}

function addVertex (array, index, geomBuffer, geomBufferindex) {
    geomBuffer.vertices[geomBufferindex] = array[index];
    geomBuffer.normals[geomBufferindex++] = 0;
    geomBuffer.vertices[geomBufferindex] = array[index + 1];
    geomBuffer.normals[geomBufferindex++] = 0;
    return geomBufferindex;
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
