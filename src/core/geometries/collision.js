import { halfPlaneTest, pointInRectangle, pointInTriangle } from '../../utils/geometry';

export function triangleCollides (triangle, viewport, viewportAABB) {
    if (_isAnyTriangleVertexInViewport(triangle, viewportAABB)) {
        return true;
    }

    if (_isViewportContainedByTriangle(triangle, viewport)) {
        return true;
    }

    return _isViewportCollidingTriangleLines(triangle, viewport);
}

function _isViewportContainedByTriangle (triangle, viewport) {
    for (let i = 0; i < viewport.length; i++) {
        if (pointInTriangle(viewport[i], triangle[0], triangle[1], triangle[2])) {
            return true;
        }
    }

    return false;
}

function _isAnyTriangleVertexInViewport (triangle, viewportAABB) {
    for (let i = 0; i < triangle.length; i++) {
        if (pointInRectangle(triangle[i], viewportAABB)) {
            return true;
        }
    }

    return false;
}

function _isViewportCollidingTriangleLines (triangle, viewport) {
    let sign = null;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < viewport.length; j++) {
            const position = halfPlaneTest(viewport[j], triangle[i], triangle[i + 1]);

            if (!sign) {
                sign = Math.sign(position);
            } else if (sign !== Math.sign(position)) {
                return false;
            }
        }
    }

    return true;
}
