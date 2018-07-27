import * as earcut from 'earcut';
import { getFloat32ArrayFromArray } from '../utils/util';
import { getJoinNormal, getLineNormal, neg } from '../utils/geometry';

// Decode a tile geometry
// If the geometry type is 'point' it will pass trough the geom (the vertex array)
// If the geometry type is 'polygon' it will triangulate the polygon list (geom)
//      geom will be a list of polygons in which each polygon will have a flat array of vertices and a list of holes indices
//      Example:
/*         let geom = [
                {
                    flat: [
                        0.,0., 1.,0., 1.,1., 0.,1., 0.,0, //A square
                        0.25,0.25, 0.75,0.25, 0.75,0.75, 0.25,0.75, 0.25,0.25//A small square
                    ]
                    holes: [5]
                }
            ]
*/
// If the geometry type is 'line' it will generate the appropriate zero-sized, vertex-shader expanded triangle list with `miter` and `bevel` joins.
// The geom will be an array of coordinates in this case
export function decodeGeom (geomType, geom) {
    switch (geomType) {
        case 'point':
            return decodePoint(geom);
        case 'polygon':
            return decodePolygon(geom);
        case 'line':
            return decodeLine(geom);
        default:
            throw new Error(`Unimplemented geometry type: '${geomType}'`);
    }
}

function decodePoint (vertices) {
    return {
        vertices: vertices,
        breakpoints: []
    };
}

function isClipped (polygon, i, j) {
    if (polygon.clipped.includes(i) && polygon.clipped.includes(j)) {
        if (polygon.clippedType[polygon.clipped.indexOf(i)] &
            polygon.clippedType[polygon.clipped.indexOf(j)]) {
            return true;
        }
    }
    return false;
}
function decodePolygon (geometry) {
    let vertices = []; // Array of triangle vertices
    let normals = [];
    let breakpoints = []; // Array of indices (to vertexArray) that separate each feature
    let featureIDToVertexIndex = new Map();
    const geometryLength = geometry.length;

    for (let i = 0; i < geometryLength; i++) {
        const feature = geometry[i];
        const featureLength = feature.length;

        for (let j = 0; j < featureLength; j++) {
            const polygon = feature[j];
            const triangles = earcut(polygon.flat, polygon.holes);
            const trianglesLength = triangles.length;

            for (let k = 0; k < trianglesLength; k++) {
                const index = triangles[k];
                vertices.push(polygon.flat[2 * index], polygon.flat[2 * index + 1]);
                normals.push(0, 0);
            }

            const lineString = polygon.flat;
            const lineStringLength = lineString.length;

            for (let l = 0; l < lineStringLength - 2; l += 2) {
                if (polygon.holes.includes((l + 2) / 2)) {
                    // Skip adding the line which connects two rings
                    continue;
                }

                const a = [lineString[l + 0], lineString[l + 1]];
                const b = [lineString[l + 2], lineString[l + 3]];

                if (isClipped(polygon, l, l + 2)) {
                    continue;
                }

                const normal = getLineNormal(b, a);

                if (Number.isNaN(normal[0]) || Number.isNaN(normal[1])) {
                    // Skip when there is no normal vector
                    continue;
                }

                addTriangle(
                    [a, a, b],
                    [normal, neg(normal), normal]
                );

                addTriangle(
                    [a, b, b],
                    [neg(normal), neg(normal), normal]
                );
            }
        }

        featureIDToVertexIndex.set(breakpoints.length, breakpoints.length === 0
            ? { start: 0, end: vertices.length }
            : { start: featureIDToVertexIndex.get(breakpoints.length - 1).end, end: vertices.length });

        breakpoints.push(vertices.length);
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

    return {
        vertices: getFloat32ArrayFromArray(vertices),
        breakpoints,
        featureIDToVertexIndex,
        normals: getFloat32ArrayFromArray(normals)
    };
}

function decodeLine (geometry) {
    let vertices = [];
    let normals = [];
    let breakpoints = []; // Array of indices (to vertexArray) that separate each feature

    let featureIDToVertexIndex = new Map();
    geometry.map(feature => {
        feature.map(lineString => {
            addLine(lineString, vertices, normals);
        });
        featureIDToVertexIndex.set(breakpoints.length, breakpoints.length === 0
            ? { start: 0, end: vertices.length }
            : { start: featureIDToVertexIndex.get(breakpoints.length - 1).end, end: vertices.length });
        breakpoints.push(vertices.length);
    });
    return {
        vertices: getFloat32ArrayFromArray(vertices),
        breakpoints,
        featureIDToVertexIndex,
        normals: getFloat32ArrayFromArray(normals)
    };
}

/**
 * Create a triangulated lineString: zero-sized, vertex-shader expanded triangle list
 * with `miter` joins. For angle < 60 joins are automatically adjusted to `bevel`.
 */
function addLine (lineString, vertices, normals) {
    let prevPoint, currentPoint, nextPoint;
    let prevNormal, nextNormal;

    // We need at least two points
    if (lineString.length >= 4) {
        // Initialize the first two points
        prevPoint = [lineString[0], lineString[1]];
        currentPoint = [lineString[2], lineString[3]];
        prevNormal = getLineNormal(prevPoint, currentPoint);

        for (let i = 4; i <= lineString.length; i += 2) {
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

export default { decodeGeom };
