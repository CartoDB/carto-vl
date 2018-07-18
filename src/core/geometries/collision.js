import { halfPlaneTestVector, pointInRectangleVector, pointInTriangleVector, checkSign } from '../../utils/geometry';

export function triangleCollides (triangle, viewport, viewportAABB) {
    // 0. Check the feature is bigger than the viewport
    for (let i = 0; i < viewport.length; i++) {
        if (pointInTriangleVector(viewport[i], triangle[0], triangle[1], triangle[2])) {
            return true;
        }
    }

    // 1. Check any triangle point is inside viewport
    for (let i = 0; i < triangle.length; i++) {
        if (pointInRectangleVector(triangle[i], viewportAABB)) {
            return true;
        }
    }

    // 2. Check viewport coordinates position against triangle lines
    for (let i = 0; i < 3; i++) {
        const positions = [];

        for (let j = 0; j < viewport.length; j++) {
            const position = halfPlaneTestVector(viewport[j], triangle[i], triangle[i + 1]);
            positions.push(position);
        }

        if (checkSign(positions)) {
            return false;
        }
    }

    return true;
}
