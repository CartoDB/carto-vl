import { getFloat32ArrayFromArray } from '../../utils/util';
import { getJoinNormal, getLineNormal, neg } from '../../utils/geometry';

// If the geometry type is 'line' it will generate the appropriate zero-sized, vertex-shader expanded triangle list with `miter` and `bevel` joins.
// The geom will be an array of coordinates in this case

export function decodeLine (geometry) {
    let vertices = [];
    let normals = [];
    let breakpoints = [];
    let featureIDToVertexIndex = new Map();

    for (let i = 0; i < geometry.length; i++) {
        const feature = geometry[i];
        for (let j = 0; j < feature.length; j++) {
            const lineString = feature[j];
            addLine(lineString, vertices, normals);
        }

        featureIDToVertexIndex.set(breakpoints.length, breakpoints.length === 0
            ? { start: 0, end: vertices.length }
            : { start: featureIDToVertexIndex.get(breakpoints.length - 1).end, end: vertices.length });

        breakpoints.push(vertices.length);
    }

    return {
        vertices: getFloat32ArrayFromArray(vertices),
        normals: getFloat32ArrayFromArray(normals),
        featureIDToVertexIndex,
        breakpoints
    };
}

/**
 * Create a triangulated lineString: zero-sized, vertex-shader expanded triangle list
 * with `miter` joins. For angle < 60 joins are automatically adjusted to `bevel`.
 */
export function addLine (lineString, vertices, normals, skipCallback) {
    let prevPoint, currentPoint, nextPoint;
    let prevNormal, nextNormal;
    let skipLine = false;

    // We need at least two points
    if (lineString.length >= 4) {
        // Initialize the first two points
        prevPoint = [lineString[0], lineString[1]];
        currentPoint = [lineString[2], lineString[3]];
        prevNormal = getLineNormal(prevPoint, currentPoint);

        for (let i = 4; i <= lineString.length; i += 2) {
            skipLine = skipCallback && skipCallback(i);

            // First triangle
            addTriangle(
                [prevPoint, prevPoint, currentPoint],
                [neg(prevNormal), prevNormal, prevNormal]
            );

            // Second triangle
            addTriangle(
                [prevPoint, currentPoint, currentPoint],
                [neg(prevNormal), prevNormal, neg(prevNormal)]
            );

            if (i <= lineString.length - 2) {
                // If there is a next point, compute its properties
                nextPoint = [lineString[i], lineString[i + 1]];
                nextNormal = getLineNormal(currentPoint, nextPoint);
                // `turnLeft` indicates that the nextLine turns to the left
                // `joinNormal` contains the direction and size for the `miter` vertex
                //  If this is not defined means that the join must be `bevel`.
                let {turnLeft, joinNormal} = getJoinNormal(prevNormal, nextNormal);

                // Third triangle
                addTriangle(
                    [currentPoint, currentPoint, currentPoint],
                    [[0, 0],
                        turnLeft ? prevNormal : neg(nextNormal),
                        turnLeft ? nextNormal : neg(prevNormal)]
                );

                if (joinNormal) {
                    // Forth triangle
                    addTriangle(
                        [currentPoint, currentPoint, currentPoint],
                        [joinNormal,
                            turnLeft ? nextNormal : neg(prevNormal),
                            turnLeft ? prevNormal : neg(nextNormal)]
                    );
                }
            }

            // Update the variables for the next iteration
            prevPoint = currentPoint;
            currentPoint = nextPoint;
            prevNormal = nextNormal;
        }
    }

    function addTriangle (p, n) {
        if (!skipLine) {
            vertices.push(
                p[0][0], p[0][1],
                p[1][0], p[1][1],
                p[2][0], p[2][1]
            );
            normals.push(
                n[0][0], n[0][1],
                n[1][0], n[1][1],
                n[2][0], n[2][1]
            );
        }
    }
}
