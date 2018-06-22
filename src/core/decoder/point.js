/**
 *  Pass trough the geometry (the vertex array)
 */

export function decodePoint(geometry) {
    return {
        vertices: geometry,
        breakpoints: []
    };
}
