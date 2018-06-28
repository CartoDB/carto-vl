/**
 * Determines if two bodies are colliding using the Separating Axis Theorem
 * https://github.com/Prozi/detect-collisions/
 */
export default function SAT(a, b, aabb = true) {
    const a_polygon = a._polygon;
    const b_polygon = b._polygon;

    if (a_polygon) {
        if (
            a._dirty_coords ||
            a.x !== a._x ||
            a.y !== a._y ||
            a.angle !== a._angle ||
            a.scale_x !== a._scale_x ||
            a.scale_y !== a._scale_y
        ) {
            a._calculateCoords();
        }
    }

    if (b_polygon) {
        if (
            b._dirty_coords ||
            b.x !== b._x ||
            b.y !== b._y ||
            b.angle !== b._angle ||
            b.scale_x !== b._scale_x ||
            b.scale_y !== b._scale_y
        ) {
            b._calculateCoords();
        }
    }

    if (!aabb || aabbAABB(a, b)) {
        if (a_polygon && a._dirty_normals) {
            a._calculateNormals();
        }

        if (b_polygon && b._dirty_normals) {
            b._calculateNormals();
        }
    }

    return polygonPolygon(a, b);
}

/**
 * Determines if two bodies' axis aligned bounding boxes are colliding
 */

function aabbAABB(a, b) {
    const a_polygon = a._polygon;
    const a_x = a_polygon ? 0 : a.x;
    const a_y = a_polygon ? 0 : a.y;
    const a_radius = a_polygon ? 0 : a.radius * a.scale;
    const a_min_x = a_polygon ? a._min_x : a_x - a_radius;
    const a_min_y = a_polygon ? a._min_y : a_y - a_radius;
    const a_max_x = a_polygon ? a._max_x : a_x + a_radius;
    const a_max_y = a_polygon ? a._max_y : a_y + a_radius;

    const b_polygon = b._polygon;
    const b_x = b_polygon ? 0 : b.x;
    const b_y = b_polygon ? 0 : b.y;
    const b_radius = b_polygon ? 0 : b.radius * b.scale;
    const b_min_x = b_polygon ? b._min_x : b_x - b_radius;
    const b_min_y = b_polygon ? b._min_y : b_y - b_radius;
    const b_max_x = b_polygon ? b._max_x : b_x + b_radius;
    const b_max_y = b_polygon ? b._max_y : b_y + b_radius;

    return a_min_x < b_max_x && a_min_y < b_max_y && a_max_x > b_min_x && a_max_y > b_min_y;
}

/**
 * Determines if two polygons are colliding
 */

function polygonPolygon(a, b) {
    const a_count = a._coords.length;
    const b_count = b._coords.length;

    // Handle points specially
    if (a_count === 2 && b_count === 2) {
        const a_coords = a._coords;
        const b_coords = b._coords;

        return a_coords[0] === b_coords[0] && a_coords[1] === b_coords[1];
    }

    const a_coords = a._coords;
    const b_coords = b._coords;
    const a_normals = a._normals;
    const b_normals = b._normals;

    if (a_count > 2) {
        for (let ix = 0, iy = 1; ix < a_count; ix += 2, iy += 2) {
            if (separatingAxis(a_coords, b_coords, a_normals[ix], a_normals[iy])) {
                return false;
            }
        }
    }

    if (b_count > 2) {
        for (let ix = 0, iy = 1; ix < b_count; ix += 2, iy += 2) {
            if (separatingAxis(a_coords, b_coords, b_normals[ix], b_normals[iy])) {
                return false;
            }
        }
    }

    return true;
}

/**
 * Determines if two polygons are separated by an axis
 */
function separatingAxis(a_coords, b_coords, x, y) {
    const a_count = a_coords.length;
    const b_count = b_coords.length;

    if (!a_count || !b_count) {
        return true;
    }

    let a_start = null;
    let a_end = null;
    let b_start = null;
    let b_end = null;

    for (let ix = 0, iy = 1; ix < a_count; ix += 2, iy += 2) {
        const dot = a_coords[ix] * x + a_coords[iy] * y;

        if (a_start === null || a_start > dot) {
            a_start = dot;
        }

        if (a_end === null || a_end < dot) {
            a_end = dot;
        }
    }

    for (let ix = 0, iy = 1; ix < b_count; ix += 2, iy += 2) {
        const dot = b_coords[ix] * x + b_coords[iy] * y;

        if (b_start === null || b_start > dot) {
            b_start = dot;
        }

        if (b_end === null || b_end < dot) {
            b_end = dot;
        }
    }

    if (a_start > b_end || a_end < b_start) {
        return true;
    }

    return false;
}
