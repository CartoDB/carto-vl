import { getJoinNormal, getLineNormal, neg } from '../../utils/geometry';

/**
 * Create a triangulated lineString: zero-sized, vertex-shader expanded triangle list
 * with `miter` joins. For angle < 60 joins are automatically adjusted to `bevel`.
 */
export function addLine (lineString, vertices, normals, isPolygon, skipCallback) {
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
                addTriangle(
                    [prevPoint, prevPoint, currentPoint],
                    [neg(prevNormal), prevNormal, prevNormal]
                );
                
                // Second triangle
                addTriangle(
                    [prevPoint, currentPoint, currentPoint],
                    [neg(prevNormal), prevNormal, neg(prevNormal)]
                );
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
                    
                    // Third triangle
                    addTriangle(
                        [currentPoint, currentPoint, currentPoint],
                        // Mark vertex to be stroke in PolygonShader with the
                        // non-zero value 1e-37, so it validates the expression
                        // `normal != vec2(0.)` without affecting the vertex position.
                        [[0, isPolygon ? 1e-37 : 0],
                            turnLeft ? prevNormal : neg(nextNormal),
                            turnLeft ? nextNormal : neg(prevNormal)]
                    );
                    
                    if (joinNormal) {
                        // Forth triangle
                        drawLine && addTriangle(
                            [currentPoint, currentPoint, currentPoint],
                            [joinNormal,
                                turnLeft ? nextNormal : neg(prevNormal),
                                turnLeft ? prevNormal : neg(nextNormal)]
                        );
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
    
    function addTriangle (p, n) {
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
