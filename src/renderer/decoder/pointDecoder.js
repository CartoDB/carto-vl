// If the geometry type is 'point' it will pass trough the geom (the vertex array)

export function decodePoint (vertices) {
    return {
        vertices: vertices,
        breakpoints: []
    };
}
