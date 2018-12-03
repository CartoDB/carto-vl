import { vec4 } from 'gl-matrix';
import { average } from '../renderer/viz/expressions/stats';
import CartoValidationError, { CartoValidationTypes as cvt } from '../errors/carto-validation-error';

export const GEOMETRY_TYPE = {
    UNKNOWN: 'unknown',
    POINT: 'point',
    LINE: 'line',
    POLYGON: 'polygon'
};

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

export function pointInCircle (p, center, radius) {
    const diff = {
        x: p.x - center.x,
        y: p.y - center.y
    };
    const lengthSquared = diff.x * diff.x + diff.y * diff.y;
    return lengthSquared <= radius * radius;
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

/**
 * Axis-Aligned Bounding Box (AABB). This creates a wrapping box around the geometry, without rotation.
 * This allows the use of a common technique to detect collision between features (using their corresponding AABBs).
 */
export function computeAABB (geometry, type) {
    switch (type) {
        case GEOMETRY_TYPE.POINT:
            return [];
        case GEOMETRY_TYPE.LINE:
        case GEOMETRY_TYPE.POLYGON:
            const aabbList = [];

            for (let i = 0; i < geometry.length; i++) {
                const feature = geometry[i];

                let aabb = {
                    minx: Number.POSITIVE_INFINITY,
                    miny: Number.POSITIVE_INFINITY,
                    maxx: Number.NEGATIVE_INFINITY,
                    maxy: Number.NEGATIVE_INFINITY
                };

                for (let j = 0; j < feature.length; j++) {
                    aabb = _updateAABBForGeometry(feature[j], aabb, type);
                }

                if (aabb.minx === Number.POSITIVE_INFINITY) {
                    aabb = null;
                }

                aabbList.push(aabb);
            }

            return aabbList;
    }
}

export function computeCentroids (decodedGeometry, type) {
    switch (type) {
        case GEOMETRY_TYPE.POINT:
            return _computeCentroidsForPoints(decodedGeometry);
        case GEOMETRY_TYPE.LINE:
        case GEOMETRY_TYPE.POLYGON:
            return _computeCentroidsForLinesOrPolygons(decodedGeometry, type);
        default:
            throw new CartoValidationError(`${cvt.INCORRECT_VALUE} Invalid type argument, decoded geometry must have a point, line or polygon type.`);
    }
}

function _computeCentroidsForPoints (decodedGeometry) {
    const centroids = [];

    // 'Compute' centroids for points is just getting one exemplar from the 3 repeated points
    const STEP = 6;
    for (let i = 0; i < decodedGeometry.vertices.length / STEP; i++) {
        const start = i * STEP;
        const end = start + STEP;
        const [, , , , x, y] = decodedGeometry.vertices.slice(start, end);
        centroids.push({ x, y });
    }
    return centroids;
}

function _computeCentroidsForLinesOrPolygons (decodedGeometry, type) {
    const centroids = [];

    let startVertex = 0;
    decodedGeometry.breakpoints.forEach((breakpoint) => {
        const vertices = decodedGeometry.vertices.slice(startVertex, breakpoint);
        let centroid = null;
        if (type === GEOMETRY_TYPE.LINE) {
            centroid = _centroidForLines(vertices);
        } else {
            centroid = _centroidForPolygons(vertices);
        }
        centroids.push(centroid);
        startVertex = breakpoint;
    });

    return centroids;
}

function _centroidForLines (vertices) {
    // Triangles don't have any area in this case, so just average coordinates are calculated
    const Xs = [];
    const Ys = [];
    const STEP = 6;
    for (let i = 0; i < vertices.length / STEP; i++) {
        const start = i * STEP;
        const end = start + STEP;
        const [xA, yA, xB, yB, xC, yC] = vertices.slice(start, end);

        const AequalB = (xA === xB && yA === yB);
        const BequalC = (xB === xC && yB === yC);

        if (AequalB && BequalC) {
            continue; // spurious triangles (useful for rendering strokes with normals, not here)
        }

        const firstPoint = [xA, yA];
        const secondPoint = !AequalB ? [xB, yB] : [xC, yC];

        Xs.push(firstPoint[0]);
        Xs.push(secondPoint[0]);

        Ys.push(firstPoint[1]);
        Ys.push(secondPoint[1]);
    }

    let centroid = {
        x: average(Xs),
        y: average(Ys)
    };
    return centroid;
}

function _centroidForPolygons (vertices) {
    // Triangles average coordinates, ponderated by their area
    const weightedXs = [];
    const weightedYs = [];
    const areas = [];

    const STEP = 6;
    for (let i = 0; i < vertices.length / STEP; i++) {
        const start = i * STEP;
        const end = start + STEP;
        const [xA, yA, xB, yB, xC, yC] = vertices.slice(start, end);
        const triangle = [[xA, yA], [xB, yB], [xC, yC]];
        const area = triangleArea(triangle);
        if (area > 0) {
            const averageX = average([xA, xB, xC]);
            const averageY = average([yA, yB, yC]);

            weightedXs.push(averageX * area);
            weightedYs.push(averageY * area);
            areas.push(area);
        }
    }
    const totalWeight = _sumArray(areas);

    let centroid = {
        x: _sumArray(weightedXs) / totalWeight,
        y: _sumArray(weightedYs) / totalWeight
    };
    return centroid;
}

function _sumArray (array) {
    return array.reduce((p, c) => p + c, 0);
}

/*
* Calculate the area of a triangle using its coordinates.
* From https://en.wikipedia.org/wiki/Triangle#Computing_the_area_of_a_triangle
*/
export function triangleArea (threeVerticesArray) {
    let [xA, yA] = threeVerticesArray[0];
    let [xB, yB] = threeVerticesArray[1];
    let [xC, yC] = threeVerticesArray[2];

    const area = Math.abs((xA - xC) * (yB - yA) - (xA - xB) * (yC - yA)) / 2.0;
    return area;
}

// Compute the WebMercator position at projected (x,y) NDC (Normalized Device Coordinates) reversing the projection of the point
export function unproject (inv, x, y) {
    // To unproject a point we need the 3 coordinates (x,y,z)
    // The `z` coordinate can be computed by knowing that the unprojected `z` is equal to `0` (since the map is a 2D plane)
    // defined at `z=0`

    // Since a matrix-vector multiplication is a linear transform we know that
    //      z = m * projectedZ + k
    // Being `m` and `k` constants for a particular value of projected `x` and `y` coordinates

    // With that equation and the inverse matrix of the projection we can establish an equation system of the form:
    //      v1 = m * v2 + k
    //      v3 = m * v4 + k
    // Where `v2` and `v4` can be arbitrary values (but not equal to each other) and
    // `v1` and `v3` can be computed by using the inverse matrix knowing that:
    //      (_, _, v1,_) = inverse(projectionMatrix) * (projectedX, projectedY, v2, 1)
    //      (_, _, v3,_) = inverse(projectionMatrix) * (projectedX, projectedY, v4, 1)

    // By resolving the the equation system above computing `m` and `k` values
    // we can compute the projected Z coordinate at the (x,y) NDC (projected) point

    // With (projectedX, projectedY, projectedZ) we can compute the unprojected point by multiplying by the inverse matrix

    // *** Implementation ***

    // compute m, k for: [z = m*projectedZ + k]
    const v2 = 1;
    const v4 = 2;

    const v1 = vec4.transformMat4([], [x, y, v2, 1], inv)[2];
    const v3 = vec4.transformMat4([], [x, y, v4, 1], inv)[2];

    // Solve the equation system by using the elimination method (subtraction of the equations)
    //      (v1-v3) = (v2-v4)*m
    //      m = (v1 - v3) / (v2 - v4)
    const m = (v1 - v3) / (v2 - v4);
    // Substituting in the first equation `m` and solving for `k`
    const k = v1 - m * v2;

    // compute projectedZ by solving `z = m * projectedZ + k` knwoing `z`, `m` and `k`
    const projectedZ = -k / m;

    // Inverse the projection and normalize by `p.w`
    return vec4.transformMat4([], [x, y, projectedZ, 1], inv).map((v, _, point) => v / point[3]);
}

function _updateAABBForGeometry (feature, aabb, geometryType) {
    switch (geometryType) {
        case GEOMETRY_TYPE.LINE:
            return _updateAABBLine(feature, aabb);
        case GEOMETRY_TYPE.POLYGON:
            return _updateAABBPolygon(feature, aabb);
    }
}

function _updateAABBLine (line, aabb) {
    const vertices = line;
    const numVertices = line.length;

    for (let i = 0; i < numVertices; i += 2) {
        aabb.minx = Math.min(aabb.minx, vertices[i + 0]);
        aabb.miny = Math.min(aabb.miny, vertices[i + 1]);
        aabb.maxx = Math.max(aabb.maxx, vertices[i + 0]);
        aabb.maxy = Math.max(aabb.maxy, vertices[i + 1]);
    }

    return aabb;
}

function _updateAABBPolygon (polygon, aabb) {
    const [vertices, numVertices] = [polygon.flat, polygon.holes[0] || polygon.flat.length / 2];

    for (let i = 0; i < numVertices; i++) {
        aabb.minx = Math.min(aabb.minx, vertices[2 * i + 0]);
        aabb.miny = Math.min(aabb.miny, vertices[2 * i + 1]);
        aabb.maxx = Math.max(aabb.maxx, vertices[2 * i + 0]);
        aabb.maxy = Math.max(aabb.maxy, vertices[2 * i + 1]);
    }

    return aabb;
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
