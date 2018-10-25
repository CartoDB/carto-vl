import { getJoinNormal, getLineNormal, neg } from '../../utils/geometry';

/**
 * Create a triangulated lineString: zero-sized, vertex-shader expanded triangle list
 * with `miter` joins. For angle < 60 joins are automatically adjusted to `bevel`.
 * https://github.com/CartoDB/carto-vl/wiki/Line-rendering
 */
export function addLineString (lineString, geomBuffer, index, isPolygon, skipCallback) {
    let prevPoint, currentPoint, nextPoint;
    let prevNormal, nextNormal;
    let drawLine;

    // We need at least two points
    if (lineString.length >= 4) {
        // Initialize the first two points
        prevPoint = [lineString[0], lineString[1]];
        currentPoint = [lineString[2], lineString[3]];
        prevNormal = getLineNormal(prevPoint, currentPoint);

        if (prevPoint[0] === currentPoint[0] && prevPoint[1] === currentPoint[1]) {
            return index;
        }

        for (let i = 4; i <= lineString.length; i += 2) {
            drawLine = !(skipCallback && skipCallback(i));

            if (drawLine) {
                // First triangle
                geomBuffer.vertices[index] = prevPoint[0];
                geomBuffer.normals[index++] = -prevNormal[0];
                geomBuffer.vertices[index] = prevPoint[1];
                geomBuffer.normals[index++] = -prevNormal[1];
                geomBuffer.vertices[index] = prevPoint[0];
                geomBuffer.normals[index++] = prevNormal[0];
                geomBuffer.vertices[index] = prevPoint[1];
                geomBuffer.normals[index++] = prevNormal[1];
                geomBuffer.vertices[index] = currentPoint[0];
                geomBuffer.normals[index++] = prevNormal[0];
                geomBuffer.vertices[index] = currentPoint[1];
                geomBuffer.normals[index++] = prevNormal[1];

                // Second triangle
                geomBuffer.vertices[index] = prevPoint[0];
                geomBuffer.normals[index++] = -prevNormal[0];
                geomBuffer.vertices[index] = prevPoint[1];
                geomBuffer.normals[index++] = -prevNormal[1];
                geomBuffer.vertices[index] = currentPoint[0];
                geomBuffer.normals[index++] = prevNormal[0];
                geomBuffer.vertices[index] = currentPoint[1];
                geomBuffer.normals[index++] = prevNormal[1];
                geomBuffer.vertices[index] = currentPoint[0];
                geomBuffer.normals[index++] = -prevNormal[0];
                geomBuffer.vertices[index] = currentPoint[1];
                geomBuffer.normals[index++] = -prevNormal[1];
            }

            // If there is a next point, compute its properties
            if (i <= lineString.length - 2) {
                nextPoint = [lineString[i], lineString[i + 1]];
            } else if (isPolygon) {
                nextPoint = [lineString[2], lineString[3]];
            }

            if (nextPoint) {
                if (nextPoint[0] === currentPoint[0] && nextPoint[1] === currentPoint[1]) {
                    return index;
                }
                nextNormal = getLineNormal(currentPoint, nextPoint);

                if (drawLine) {
                    // `turnLeft` indicates that the nextLine turns to the left
                    // `joinNormal` contains the direction and size for the `miter` vertex
                    //  If this is not defined means that the join must be `bevel`.
                    let { turnLeft, joinNormal } = getJoinNormal(prevNormal, nextNormal);

                    let leftNormal = turnLeft ? prevNormal : neg(nextNormal);
                    let rightNormal = turnLeft ? nextNormal : neg(prevNormal);

                    // Third triangle
                    geomBuffer.vertices[index] = currentPoint[0];
                    geomBuffer.normals[index++] = 0;
                    geomBuffer.vertices[index] = currentPoint[1];
                    // Mark vertex to be stroke in PolygonShader with the
                    // non-zero value 1e-37, so it validates the expression
                    // `normal != vec2(0.)` without affecting the vertex position.
                    geomBuffer.normals[index++] = isPolygon ? 1e-37 : 0;
                    geomBuffer.vertices[index] = currentPoint[0];
                    geomBuffer.normals[index++] = leftNormal[0];
                    geomBuffer.vertices[index] = currentPoint[1];
                    geomBuffer.normals[index++] = leftNormal[1];
                    geomBuffer.vertices[index] = currentPoint[0];
                    geomBuffer.normals[index++] = rightNormal[0];
                    geomBuffer.vertices[index] = currentPoint[1];
                    geomBuffer.normals[index++] = rightNormal[1];

                    if (joinNormal) {
                        // Forth triangle
                        geomBuffer.vertices[index] = currentPoint[0];
                        geomBuffer.normals[index++] = joinNormal[0];
                        geomBuffer.vertices[index] = currentPoint[1];
                        geomBuffer.normals[index++] = joinNormal[1];
                        geomBuffer.vertices[index] = currentPoint[0];
                        geomBuffer.normals[index++] = rightNormal[0];
                        geomBuffer.vertices[index] = currentPoint[1];
                        geomBuffer.normals[index++] = rightNormal[1];
                        geomBuffer.vertices[index] = currentPoint[0];
                        geomBuffer.normals[index++] = leftNormal[0];
                        geomBuffer.vertices[index] = currentPoint[1];
                        geomBuffer.normals[index++] = leftNormal[1];
                    }
                }
            }

            // Update the variables for the next iteration
            prevPoint = currentPoint;
            currentPoint = nextPoint;
            prevNormal = nextNormal;
            nextPoint = null;
        }
    }
    return index;
}

/**
 * Resize a Float32Array buffer in an efficient way
 */
export function resizeBuffer (oldBuffer, newSize) {
    const newBuffer = new Float32Array(newSize);
    newBuffer.set(oldBuffer);
    return newBuffer;
}
