import { halfPlaneSign, equalPoints } from './geometry';
import { lineclip } from './lineclip';

const SEPARATING_LINE_FOUND = 'separatingLineFound';
const SEPARATING_LINE_NOT_FOUND = 'separatingLineNotFound';

export function triangleCollides (triangle, viewportAABB) {
    if (_triangleForLine(triangle)) {
        return _triangleForLineCollides(triangle, viewportAABB);
    }

    /*
     * TODO
     *
     * Optimize triangle collision:
     *
     * if (_isAnyTriangleVertexInViewport(triangle, viewportAABB)) {
     *   return true;
     * }
     *
     * if (_isAnyViewportVertexInTriangle(triangle, viewport)) {
     *   return true;
     * }
     */

    if (_viewportLineSeparatesTriangle(viewportAABB, triangle) === SEPARATING_LINE_FOUND) {
        return false;
    }

    const viewport = [
        { x: viewportAABB.minx, y: viewportAABB.miny },
        { x: viewportAABB.minx, y: viewportAABB.maxy },
        { x: viewportAABB.maxx, y: viewportAABB.miny },
        { x: viewportAABB.maxx, y: viewportAABB.maxy }
    ];
    if (_triangleLineSeparatesViewport(triangle, viewport) === SEPARATING_LINE_FOUND) {
        return false;
    }

    return true;
}

/**
 * When dealing with line's triangles, repeated vertices are generated (not strictly triangles,
 * as they don't have any area).
 */
function _triangleForLine (triangle) {
    const [v1, v2, v3] = triangle;
    return (equalPoints(v1, v2) || equalPoints(v2, v3));
}

/**
 * Calculates the collision for the special case of a triangle from a line.
 * With repeated vertices, the triangle can be simplified to a line and calculate using `lineclip`.
 * This algorithm also solves the problem when line vertices are completely outside the viewport and the
 * line wasn't considered an intersecting one by the 'separating line' algorithm
 */
function _triangleForLineCollides (triangle, viewportAABB) {
    const [v1, v2, v3] = triangle;
    const a = v1;
    const b = equalPoints(v2, a) ? v3 : v2;
    const bbox = [viewportAABB.minx, viewportAABB.miny, viewportAABB.maxx, viewportAABB.maxy];
    const collides = lineclip([[a.x, a.y], [b.x, b.y]], bbox);
    return (collides.length > 0);
}

/*
 * TODO
 *
 * Optimize triangle collision:
 *
 * function _isAnyViewportVertexInTriangle (triangle, viewport) {
 *     for (let i = 0; i < viewport.length; i++) {
 *         if (pointInTriangle(viewport[i], triangle[0], triangle[1], triangle[2])) {
 *             return true;
 *         }
 *     }
 *
 *     return false;
 * }
 * function _isAnyTriangleVertexInViewport (triangle, viewportAABB) {
 *  for (let i = 0; i < 3; i++) {
 *       if (pointInRectangle(triangle[i], viewportAABB)) {
 *           return true;
 *       }
 *   }
 *   return false;
 * }
 */

function _viewportLineSeparatesTriangle (viewportAABB, triangle) {
    if (triangle[0].x < viewportAABB.minx &&
        triangle[1].x < viewportAABB.minx &&
        triangle[2].x < viewportAABB.minx) {
        return SEPARATING_LINE_FOUND;
    }

    if (triangle[0].y < viewportAABB.miny &&
        triangle[1].y < viewportAABB.miny &&
        triangle[2].y < viewportAABB.miny) {
        return SEPARATING_LINE_FOUND;
    }

    if (triangle[0].x > viewportAABB.maxx &&
        triangle[1].x > viewportAABB.maxx &&
        triangle[2].x > viewportAABB.maxx) {
        return SEPARATING_LINE_FOUND;
    }

    if (triangle[0].y > viewportAABB.maxy &&
        triangle[1].y > viewportAABB.maxy &&
        triangle[2].y > viewportAABB.maxy) {
        return SEPARATING_LINE_FOUND;
    }

    return SEPARATING_LINE_NOT_FOUND;
}

function _triangleLineSeparatesViewport (triangle, viewport) {
    const TRIANGLE_VERTICES = 3;

    for (let i = 0; i < TRIANGLE_VERTICES; i++) {
        for (let j = 0; j < viewport.length; j++) {
            const position = halfPlaneSign(viewport[j], triangle[i], triangle[(i + 1) % TRIANGLE_VERTICES]);

            if (position > 0) {
                break;
            }

            if (j === TRIANGLE_VERTICES) {
                return SEPARATING_LINE_FOUND;
            }
        }
    }

    return SEPARATING_LINE_NOT_FOUND;
}
