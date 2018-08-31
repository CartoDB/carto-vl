// If the geometry type is 'point' it will pass trough the geom (the vertex array)

export function decodePoint (verticesArrayBuffer) {
    return {
        verticesArrayBuffer: verticesArrayBuffer,
        vertices: new Float32Array(verticesArrayBuffer),
        breakpoints: []
    };
}
