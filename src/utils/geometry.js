// If AB intersects CD => return intersection point
// Intersection method from Real Time Rendering, Third Edition, page 780
export function intersect (a, b, c, d) {
    const o1 = a;
    const o2 = c;
    const d1 = sub(b, a);
    const d2 = sub(d, c);
    const d1t = perpendicular(d1);
    const d2t = perpendicular(d2);

    const s = dot(sub(o2, o1), d2t) / dot(d1, d2t);
    const t = dot(sub(o1, o2), d1t) / dot(d2, d1t);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
        return [o1[0] + s * d1[0], o1[1] + s * d1[1]];
    }
}

export function sub ([ax, ay], [bx, by]) {
    return ([ax - bx, ay - by]);
}

export function dot ([ax, ay], [bx, by]) {
    return (ax * bx + ay * by);
}

export function perpendicular ([x, y]) {
    return [-y, x];
}

/**
 * Compute the normal of a line AB.
 * By definition it is the unitary vector from B to A, rotated +90 degrees counter-clockwise
 */
export function getLineNormal (a, b) {
    const u = normalize(a[0] - b[0], a[1] - b[1]);
    return [-u[1], u[0]];
}

/**
 * Compute the normal of the join from the lines' normals.
 * By definition this is the sum of the unitary vectors `u` (from B to A) and `v` (from B to C)
 * multiplied by a factor of `1/sin(theta)` to reach the intersection of the wide lines.
 * Theta is the angle between the vectors `v` and `u`. But instead of computing the angle,
 * the `sin(theta)` (with sign) is obtained directly from the vectorial product of `v` and `u`
 */
export function getJoinNormal (prevNormal, nextNormal) {
    const u = [prevNormal[1], -prevNormal[0]];
    const v = [-nextNormal[1], nextNormal[0]];
    const sin = v[0] * u[1] - v[1] * u[0];
    const cos = v[0] * u[0] + v[1] * u[1];
    const factor = Math.abs(sin);
    const miterJoin = !(factor < 0.866 && cos > 0.5); // 60 deg
    return {
        turnLeft: sin > 0,
        joinNormal: miterJoin && neg([
            (u[0] + v[0]) / factor,
            (u[1] + v[1]) / factor
        ])
    };
}

/**
 * Return the negative of the provided vector
 */
export function neg (v) {
    return [-v[0], -v[1]];
}

/**
 * Return the vector scaled to length 1
 */
function normalize (x, y) {
    const s = Math.hypot(x, y);
    return [x / s, y / s];
}

// Returns true if p is inside the triangle or on a triangle's edge, false otherwise
// Parameters in {x: 0, y:0} form
export function pointInTriangle (p, v1, v2, v3) {
    // https://stackoverflow.com/questions/2049582/how-to-determine-if-a-point-is-in-a-2d-triangle
    // contains an explanation of both this algorithm and one based on barycentric coordinates,
    // which could be faster, but, nevertheless, it is quite similar in terms of required arithmetic operations

    if (equalPoints(v1, v2) || equalPoints(v2, v3) || equalPoints(v3, v1)) {
        // Avoid zero area triangle
        return false;
    }

    // A point is inside a triangle or in one of the triangles edges
    // if the point is in the three half-plane defined by the 3 edges
    const b1 = halfPlaneSign(p, v1, v2) < 0;
    const b2 = halfPlaneSign(p, v2, v3) < 0;
    const b3 = halfPlaneSign(p, v3, v1) < 0;

    return (b1 === b2) && (b2 === b3);
}

// Tests if a point `p` is in the half plane defined by the line with points `a` and `b`
// Returns a negative number if the result is INSIDE, returns 0 if the result is ON_LINE,
// returns >0 if the point is OUTSIDE
// Parameters in {x: 0, y:0} form
export function halfPlaneSign (p, a, b) {
    // We use the cross product of `PB x AB` to get `sin(angle(PB, AB))`
    // The result's sign is the half plane test result
    return (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
}

export function equalPoints (a, b) {
    return (a.x === b.x) && (a.y === b.y);
}

export function pointInCircle (p, center, scale) {
    const diff = {
        x: p.x - center.x,
        y: p.y - center.y
    };
    const lengthSquared = diff.x * diff.x + diff.y * diff.y;
    return lengthSquared <= scale * scale;
}

export function pointInRectangle (point, bbox) {
    if (bbox === null) {
        return false;
    }
    const p = {
        x: point.x.toFixed(2),
        y: point.y.toFixed(2)
    };

    return ((bbox.minx <= p.x) && (p.x <= bbox.maxx) && (bbox.miny <= p.y) && (p.y <= bbox.maxy));
}

export default {
    intersect,
    sub,
    dot,
    perpendicular,
    getLineNormal,
    getJoinNormal,
    neg,
    halfPlaneSign,
    pointInTriangle,
    equalPoints,
    pointInCircle,
    pointInRectangle
};
