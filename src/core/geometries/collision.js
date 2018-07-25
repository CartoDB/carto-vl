import { signedDistanceFromPointToLine, pointInRectangle, pointInTriangle } from '../../utils/geometry';

const nocollides = 'no-collides';
const unknown = 'unknown';

export function triangleCollides (triangle, viewportAABB) {
    const viewport = [
        { x: viewportAABB.minx, y: viewportAABB.miny },
        { x: viewportAABB.minx, y: viewportAABB.maxy },
        { x: viewportAABB.maxx, y: viewportAABB.miny },
        { x: viewportAABB.maxx, y: viewportAABB.maxy }
    ];

    if (_isAnyTriangleVertexInViewport(triangle, viewportAABB)) {
        return true;
    }

    if (_isAnyViewportVertexInTriangle(triangle, viewport)) {
        return true;
    }

    if (_viewportLineSeparatesTriangle(viewportAABB, triangle) === nocollides) {
        return false;
    }

    if (_triangleLineSeparatesViewport(triangle, viewport) === nocollides) {
        return false;
    }

    return true;
}

function _isAnyViewportVertexInTriangle (triangle, viewport) {
    for (let i = 0; i < viewport.length; i++) {
        if (pointInTriangle(viewport[i], triangle[0], triangle[1], triangle[2])) {
            return true;
        }
    }

    return false;
}

function _isAnyTriangleVertexInViewport (triangle, viewportAABB) {
    for (let i = 0; i < 3; i++) {
        if (pointInRectangle(triangle[i], viewportAABB)) {
            return true;
        }
    }

    return false;
}

function _viewportLineSeparatesTriangle (viewportAABB, triangle) {
    // TODO
}

function _triangleLineSeparatesViewport (triangle, viewport) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < viewport.length; j++) {
            const position = signedDistanceFromPointToLine(viewport[j], triangle[i], triangle[i + 1]);

            if (position < 0) {
                break;
            }

            if (j === 3) {
                // is separating line
                return nocollides;
            }
        }
    }

    return unknown;
}
