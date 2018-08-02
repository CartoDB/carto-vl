import { getJoinNormal, getLineNormal, neg } from '../../utils/geometry';

/**
 * Create a triangulated lineString: zero-sized, vertex-shader expanded triangle list
 * with `miter` joins. For angle < 60 joins are automatically adjusted to `bevel`.
 */
export function addLine (lineString, vertices, normals, index, isPolygon, skipCallback) {
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
                vertices[index] = prevPoint[0];
                normals[index++] = -prevNormal[0];
                vertices[index] = prevPoint[1];
                normals[index++] = -prevNormal[1];
                vertices[index] = prevPoint[0];
                normals[index++] = prevNormal[0];
                vertices[index] = prevPoint[1];
                normals[index++] = prevNormal[1];
                vertices[index] = currentPoint[0];
                normals[index++] = prevNormal[0];
                vertices[index] = currentPoint[1];
                normals[index++] = prevNormal[1];

                // Second triangle
                vertices[index] = prevPoint[0];
                normals[index++] = -prevNormal[0];
                vertices[index] = prevPoint[1];
                normals[index++] = -prevNormal[1];
                vertices[index] = currentPoint[0];
                normals[index++] = prevNormal[0];
                vertices[index] = currentPoint[1];
                normals[index++] = prevNormal[1];
                vertices[index] = currentPoint[0];
                normals[index++] = -prevNormal[0];
                vertices[index] = currentPoint[1];
                normals[index++] = -prevNormal[1];

                // vertices.push(
                //     prevPoint[0], prevPoint[1],
                //     prevPoint[0], prevPoint[1],
                //     currentPoint[0], currentPoint[1],
                //     prevPoint[0], prevPoint[1],
                //     currentPoint[0], currentPoint[1],
                //     currentPoint[0], currentPoint[1]
                // );
                // normals.push(
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
                    vertices[index] = currentPoint[0];
                    normals[index++] = 0;
                    vertices[index] = currentPoint[1];
                    normals[index++] = isPolygon ? 1e-37 : 0;
                    vertices[index] = currentPoint[0];
                    normals[index++] = leftNormal[0];
                    vertices[index] = currentPoint[1];
                    normals[index++] = leftNormal[1];
                    vertices[index] = currentPoint[0];
                    normals[index++] = rightNormal[0];
                    vertices[index] = currentPoint[1];
                    normals[index++] = rightNormal[1];

                    // vertices.push(
                    //     currentPoint[0], currentPoint[1],
                    //     currentPoint[0], currentPoint[1],
                    //     currentPoint[0], currentPoint[1]
                    // );
                    // normals.push(
                    //     // Mark vertex to be stroke in PolygonShader with the
                    //     // non-zero value 1e-37, so it validates the expression
                    //     // `normal != vec2(0.)` without affecting the vertex position.
                    //     0, isPolygon ? 1e-37 : 0,
                    //     leftNormal[0], leftNormal[1],
                    //     rightNormal[0], rightNormal[1]
                    // );

                    if (joinNormal) {
                        // Forth triangle
                        vertices[index] = currentPoint[0];
                        normals[index++] = joinNormal[0];
                        vertices[index] = currentPoint[1];
                        normals[index++] = joinNormal[1];
                        vertices[index] = currentPoint[0];
                        normals[index++] = rightNormal[0];
                        vertices[index] = currentPoint[1];
                        normals[index++] = rightNormal[1];
                        vertices[index] = currentPoint[0];
                        normals[index++] = leftNormal[0];
                        vertices[index] = currentPoint[1];
                        normals[index++] = leftNormal[1];

                        // vertices.push(
                        //     currentPoint[0], currentPoint[1],
                        //     currentPoint[0], currentPoint[1],
                        //     currentPoint[0], currentPoint[1]
                        // );
                        // normals.push(
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

    return index;
}
