import { getJoinNormal, getLineNormal, neg } from '../../utils/geometry';

/**
 * Create a triangulated lineString: zero-sized, vertex-shader expanded triangle list
 * with `miter` joins. For angle < 60 joins are automatically adjusted to `bevel`.
 */
export function addLineString (lineString, geomBuffer, isPolygon, skipCallback) {
    let prevPoint, currentPoint, nextPoint;
    let prevNormal, nextNormal;
    let drawLine;

    // We need at least two points
    if (lineString.length >= 4) {
        // Initialize the first two points
        prevPoint = [lineString[0], lineString[1]];
        currentPoint = [lineString[2], lineString[3]];
        prevNormal = getLineNormal(prevPoint, currentPoint);

        for (let i = 4; i <= lineString.length; i += 2) {
            drawLine = !(skipCallback && skipCallback(i));

            if (drawLine) {
                // First triangle
                geomBuffer.vertices[geomBuffer.index] = prevPoint[0];
                geomBuffer.normals[geomBuffer.index++] = -prevNormal[0];
                geomBuffer.vertices[geomBuffer.index] = prevPoint[1];
                geomBuffer.normals[geomBuffer.index++] = -prevNormal[1];
                geomBuffer.vertices[geomBuffer.index] = prevPoint[0];
                geomBuffer.normals[geomBuffer.index++] = prevNormal[0];
                geomBuffer.vertices[geomBuffer.index] = prevPoint[1];
                geomBuffer.normals[geomBuffer.index++] = prevNormal[1];
                geomBuffer.vertices[geomBuffer.index] = currentPoint[0];
                geomBuffer.normals[geomBuffer.index++] = prevNormal[0];
                geomBuffer.vertices[geomBuffer.index] = currentPoint[1];
                geomBuffer.normals[geomBuffer.index++] = prevNormal[1];

                // Second triangle
                geomBuffer.vertices[geomBuffer.index] = prevPoint[0];
                geomBuffer.normals[geomBuffer.index++] = -prevNormal[0];
                geomBuffer.vertices[geomBuffer.index] = prevPoint[1];
                geomBuffer.normals[geomBuffer.index++] = -prevNormal[1];
                geomBuffer.vertices[geomBuffer.index] = currentPoint[0];
                geomBuffer.normals[geomBuffer.index++] = prevNormal[0];
                geomBuffer.vertices[geomBuffer.index] = currentPoint[1];
                geomBuffer.normals[geomBuffer.index++] = prevNormal[1];
                geomBuffer.vertices[geomBuffer.index] = currentPoint[0];
                geomBuffer.normals[geomBuffer.index++] = -prevNormal[0];
                geomBuffer.vertices[geomBuffer.index] = currentPoint[1];
                geomBuffer.normals[geomBuffer.index++] = -prevNormal[1];

                // geomBuffer.vertices.push(
                //     prevPoint[0], prevPoint[1],
                //     prevPoint[0], prevPoint[1],
                //     currentPoint[0], currentPoint[1],
                //     prevPoint[0], prevPoint[1],
                //     currentPoint[0], currentPoint[1],
                //     currentPoint[0], currentPoint[1]
                // );
                // geomBuffer.normals.push(
                //     -prevNormal[0], -prevNormal[1],
                //     prevNormal[0], prevNormal[1],
                //     prevNormal[0], prevNormal[1],
                //     -prevNormal[0], -prevNormal[1],
                //     prevNormal[0], prevNormal[1],
                //     -prevNormal[0], -prevNormal[1]
                // );
            }

            // If there is a next point, compute its properties
            if (i <= lineString.length - 2) {
                nextPoint = [lineString[i], lineString[i + 1]];
            } else if (isPolygon) {
                nextPoint = [lineString[2], lineString[3]];
            }

            if (nextPoint) {
                nextNormal = getLineNormal(currentPoint, nextPoint);

                if (drawLine) {
                    // `turnLeft` indicates that the nextLine turns to the left
                    // `joinNormal` contains the direction and size for the `miter` vertex
                    //  If this is not defined means that the join must be `bevel`.
                    let {turnLeft, joinNormal} = getJoinNormal(prevNormal, nextNormal);

                    let leftNormal = turnLeft ? prevNormal : neg(nextNormal);
                    let rightNormal = turnLeft ? nextNormal : neg(prevNormal);

                    // Third triangle
                    geomBuffer.vertices[geomBuffer.index] = currentPoint[0];
                    geomBuffer.normals[geomBuffer.index++] = 0;
                    geomBuffer.vertices[geomBuffer.index] = currentPoint[1];
                    geomBuffer.normals[geomBuffer.index++] = isPolygon ? 1e-37 : 0;
                    geomBuffer.vertices[geomBuffer.index] = currentPoint[0];
                    geomBuffer.normals[geomBuffer.index++] = leftNormal[0];
                    geomBuffer.vertices[geomBuffer.index] = currentPoint[1];
                    geomBuffer.normals[geomBuffer.index++] = leftNormal[1];
                    geomBuffer.vertices[geomBuffer.index] = currentPoint[0];
                    geomBuffer.normals[geomBuffer.index++] = rightNormal[0];
                    geomBuffer.vertices[geomBuffer.index] = currentPoint[1];
                    geomBuffer.normals[geomBuffer.index++] = rightNormal[1];

                    // geomBuffer.vertices.push(
                    //     currentPoint[0], currentPoint[1],
                    //     currentPoint[0], currentPoint[1],
                    //     currentPoint[0], currentPoint[1]
                    // );
                    // geomBuffer.normals.push(
                    //     // Mark vertex to be stroke in PolygonShader with the
                    //     // non-zero value 1e-37, so it validates the expression
                    //     // `normal != vec2(0.)` without affecting the vertex position.
                    //     0, isPolygon ? 1e-37 : 0,
                    //     leftNormal[0], leftNormal[1],
                    //     rightNormal[0], rightNormal[1]
                    // );

                    if (joinNormal) {
                        // Forth triangle
                        geomBuffer.vertices[geomBuffer.index] = currentPoint[0];
                        geomBuffer.normals[geomBuffer.index++] = joinNormal[0];
                        geomBuffer.vertices[geomBuffer.index] = currentPoint[1];
                        geomBuffer.normals[geomBuffer.index++] = joinNormal[1];
                        geomBuffer.vertices[geomBuffer.index] = currentPoint[0];
                        geomBuffer.normals[geomBuffer.index++] = rightNormal[0];
                        geomBuffer.vertices[geomBuffer.index] = currentPoint[1];
                        geomBuffer.normals[geomBuffer.index++] = rightNormal[1];
                        geomBuffer.vertices[geomBuffer.index] = currentPoint[0];
                        geomBuffer.normals[geomBuffer.index++] = leftNormal[0];
                        geomBuffer.vertices[geomBuffer.index] = currentPoint[1];
                        geomBuffer.normals[geomBuffer.index++] = leftNormal[1];

                        // geomBuffer.vertices.push(
                        //     currentPoint[0], currentPoint[1],
                        //     currentPoint[0], currentPoint[1],
                        //     currentPoint[0], currentPoint[1]
                        // );
                        // geomBuffer.normals.push(
                        //     joinNormal[0], joinNormal[1],
                        //     rightNormal[0], rightNormal[1],
                        //     leftNormal[0], leftNormal[1]
                        // );
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
}
