//If AB intersects CD => return intersection point
// Intersection method from Real Time Rendering, Third Edition, page 780
export function intersect(a, b, c, d) {
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


export function sub([ax, ay], [bx, by]) {
    return ([ax - bx, ay - by]);
}

export function dot([ax, ay], [bx, by]) {
    return (ax * bx + ay * by);
}

export function perpendicular([x, y]) {
    return [-y, x];
}

export default {
    intersect,
    sub,
    dot,
    perpendicular
};
