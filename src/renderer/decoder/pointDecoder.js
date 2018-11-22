// If the geometry type is GEOMETRY_TYPE.POINT it will pass through the geom (the vertex array)

export function decodePoint (verticesArrayBuffer) {
    return {
        verticesArrayBuffer: verticesArrayBuffer,
        vertices: new Float32Array(verticesArrayBuffer),
        breakpoints: []
    };
}
