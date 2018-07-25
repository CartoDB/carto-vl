import { signedDistanceFromPointToLine } from '../../utils/geometry';

const separatingLineFound = 'separatingLineFound';
const noSeparatingLineFound = 'noSeparatingLineFound';

export function triangleCollides (triangle, viewportAABB) {
    const viewport = [
        { x: viewportAABB.minx, y: viewportAABB.miny },
        { x: viewportAABB.minx, y: viewportAABB.maxy },
        { x: viewportAABB.maxx, y: viewportAABB.miny },
        { x: viewportAABB.maxx, y: viewportAABB.maxy }
    ];

    // possible optimizations (requires profiling)
    // if (_isAnyTriangleVertexInViewport(triangle, viewportAABB)) {
    //     return true;
    // }

    // if (_isAnyViewportVertexInTriangle(triangle, viewport)) {
    //     return true;
    // }

    if (_viewportLineSeparatesTriangle(viewportAABB, triangle) === separatingLineFound) {
        return false;
    }

    if (_triangleLineSeparatesViewport(triangle, viewport) === separatingLineFound) {
        return false;
    }

    return true;
}

// These functions could be used to optimize `triangleCollides`, but it requires profiling
// function _isAnyViewportVertexInTriangle (triangle, viewport) {
//     for (let i = 0; i < viewport.length; i++) {
//         if (pointInTriangle(viewport[i], triangle[0], triangle[1], triangle[2])) {
//             return true;
//         }
//     }

//     return false;
// }

// function _isAnyTriangleVertexInViewport (triangle, viewportAABB) {
//     for (let i = 0; i < 3; i++) {
//         if (pointInRectangle(triangle[i], viewportAABB)) {
//             return true;
//         }
//     }

//     return false;
// }

function _viewportLineSeparatesTriangle (viewportAABB, triangle) {
    if (triangle[0].x < viewportAABB.minx &&
        triangle[1].x < viewportAABB.minx &&
        triangle[2].x < viewportAABB.minx) {
        // is separating line
        return separatingLineFound;
    }
    if (triangle[0].y < viewportAABB.miny &&
        triangle[1].y < viewportAABB.miny &&
        triangle[2].y < viewportAABB.miny) {
        // is separating line
        return separatingLineFound;
    }
    if (triangle[0].x > viewportAABB.maxx &&
        triangle[1].x > viewportAABB.maxx &&
        triangle[2].x > viewportAABB.maxx) {
        // is separating line
        return separatingLineFound;
    }
    if (triangle[0].y > viewportAABB.maxy &&
        triangle[1].y > viewportAABB.maxy &&
        triangle[2].y > viewportAABB.maxy) {
        // is separating line
        return separatingLineFound;
    }
    return noSeparatingLineFound;
}

function _triangleLineSeparatesViewport (triangle, viewport) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < viewport.length; j++) {
            const position = signedDistanceFromPointToLine(viewport[j], triangle[i], triangle[i + 1]);

            if (position > 0) {
                break;
            }

            if (j === 3) {
                // is separating line
                return separatingLineFound;
            }
        }
    }

    return noSeparatingLineFound;
}
