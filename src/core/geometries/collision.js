import { signedDistanceFromPointToLine, pointInRectangle, pointInTriangle } from '../../utils/geometry';

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

    return _isViewportCollidingTriangleLines(triangle, viewport);
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
            const position = signedDistanceFromPointToLine(viewport[j], triangle[i], triangle[i + 1]);

            if (!sign) {
                sign = Math.sign(position);
            }

            if (_isSeparatedAxis(sign, position)) {
                return false;
            }
        }
    }

    return true;
}

function _isSeparatedAxis (sign, position) {
    return sign !== Math.sign(position);
}
