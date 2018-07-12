/**
 * Determines if two bodies are colliding using the Separating Axis Theorem
 * https://github.com/Prozi/detect-collisions/
 */
export default function SAT(a, b, aabb = true) {
    if (a.isPolygon) {
        if (
            a._dirtyCoords ||
            a.x !== a._x ||
            a.y !== a._y ||
            a.angle !== a._angle ||
            a.scaleX !== a._scaleX ||
            a.scaleY !== a._scaleY
        ) {
            a._calculateCoords();
        }
    }

    if (b.isPolygon) {
        if (
            b._dirtyCoords ||
            b.x !== b._x ||
            b.y !== b._y ||
            b.angle !== b._angle ||
            b.scaleX !== b._scaleX ||
            b.scaleY !== b._scaleY
        ) {
            b._calculateCoords();
        }
    }

    if (!aabb || _aabbAABB(a, b)) {
        if (a.isPolygon && a._dirtyNormals) {
            a._calculateNormalsAndEdges();
        }

        if (b.isPolygon && b._dirtyNormals) {
            b._calculateNormalsAndEdges();
        }
    }

    return _polygonCollision(a, b);
}

/**
 * Determines if two bodies' axis aligned bounding boxes are colliding
 */
function _aabbAABB(a, b) {
    const aPolygon = a.isPolygon;
    const aX = aPolygon ? 0 : a.x;
    const aY = aPolygon ? 0 : a.y;
    const aRadius = aPolygon ? 0 : a.radius * a.scale;
    const aMinX = aPolygon ? a._minX : aX - aRadius;
    const aMinY = aPolygon ? a._minY : aY - aRadius;
    const aMaxX = aPolygon ? a._maxX : aX + aRadius;
    const aMaxY = aPolygon ? a._maxY : aY + aRadius;

    const bPolygon = b.isPolygon;
    const bX = bPolygon ? 0 : b.x;
    const bY = bPolygon ? 0 : b.y;
    const bRadius = bPolygon ? 0 : b.radius * b.scale;
    const bMinX = bPolygon ? b._minX : bX - bRadius;
    const b_minY = bPolygon ? b._minY : bY - bRadius;
    const bMaxX = bPolygon ? b._maxX : bX + bRadius;
    const b_maxY = bPolygon ? b._maxY : bY + bRadius;

    return aMinX < bMaxX && aMinY < b_maxY && aMaxX > bMinX && aMaxY > b_minY;
}

/**
 * Determines if two polygons are colliding
 */

function _polygonCollision(a, b) {
    const aCount = a._coords.length;
    const bCount = b._coords.length;

    // Handle points specially
    if (aCount === 2 && bCount === 2) {
        const aCoords = a._coords;
        const bCoords = b._coords;

        return aCoords[0] === bCoords[0] && aCoords[1] === bCoords[1];
    }

    const aCoords = a._coords;
    const bCoords = b._coords;
    const aNormals = a._normals;
    const bNormals = b._normals;

    if (aCount > 2) {
        for (let ix = 0, iy = 1; ix < aCount; ix += 2, iy += 2) {
            if (separatingAxis(aCoords, bCoords, aNormals[ix], aNormals[iy])) {
                return false;
            }
        }
    }

    if (bCount > 2) {
        for (let ix = 0, iy = 1; ix < bCount; ix += 2, iy += 2) {
            if (separatingAxis(aCoords, bCoords, bNormals[ix], bNormals[iy])) {
                return false;
            }
        }
    }

    return true;
}

/**
 * Determines if two polygons are separated by an axis
 */
function separatingAxis(aCoords, bCoords, x, y) {
    const aCount = aCoords.length;
    const bCount = bCoords.length;

    if (!aCount || !bCount) {
        return true;
    }

    let aStart = null;
    let aEnd = null;
    let bStart = null;
    let bEnd = null;

    for (let ix = 0, iy = 1; ix < aCount; ix += 2, iy += 2) {
        const dot = aCoords[ix] * x + aCoords[iy] * y;

        if (aStart === null || aStart > dot) {
            aStart = dot;
        }

        if (aEnd === null || aEnd < dot) {
            aEnd = dot;
        }
    }

    for (let ix = 0, iy = 1; ix < bCount; ix += 2, iy += 2) {
        const dot = bCoords[ix] * x + bCoords[iy] * y;

        if (bStart === null || bStart > dot) {
            bStart = dot;
        }

        if (bEnd === null || bEnd < dot) {
            bEnd = dot;
        }
    }

    if (aStart > bEnd || aEnd < bStart) {
        return true;
    }

    return false;
}
