import { halfPlaneTest, pointInRectangle, pointInTriangle, checkSign } from '../../utils/geometry';

export function triangleCollides (triangle, viewport, viewportAABB) {
    if (_isFeatureGreaterThanViewport(triangle, viewport)) {
        return true;
    }

    if (_isTriangleInViewport(triangle, viewportAABB)) {
        return true;
    }

    return _isViewportCollidingTriangleLines(triangle, viewport);
}

function _isFeatureGreaterThanViewport (triangle, viewport) {
    for (let i = 0; i < viewport.length; i++) {
        if (pointInTriangle(viewport[i], triangle[0], triangle[1], triangle[2])) {
            return true;
        }
    }

    return false;
}

function _isTriangleInViewport (triangle, viewportAABB) {
    for (let i = 0; i < triangle.length; i++) {
        if (pointInRectangle(triangle[i], viewportAABB)) {
            return true;
        }
    }

    return false;
}

function _isViewportCollidingTriangleLines (triangle, viewport) {
    for (let i = 0; i < 3; i++) {
        const positions = [];

        for (let j = 0; j < viewport.length; j++) {
            const position = halfPlaneTest(viewport[j], triangle[i], triangle[i + 1]);
            positions.push(position);
        }

        if (checkSign(positions)) {
            return false;
        }
    }

    return true;
}
