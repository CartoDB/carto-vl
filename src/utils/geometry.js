function clipPolygon(preClippedVertices, polygon, isHole) {
    // Sutherland-Hodgman Algorithm to clip polygons to the tile
    // https://www.cs.drexel.edu/~david/Classes/CS430/Lectures/L-05_Polygons.6.pdf
    const clippingEdges = [
        p => p[0] <= 1,
        p => p[1] <= 1,
        p => p[0] >= -1,
        p => p[1] >= -1,
    ];

    const clippingEdgeIntersectFn = [
        (a, b) => this._intersect(a, b, [1, -10], [1, 10]),
        (a, b) => this._intersect(a, b, [-10, 1], [10, 1]),
        (a, b) => this._intersect(a, b, [-1, -10], [-1, 10]),
        (a, b) => this._intersect(a, b, [-10, -1], [10, -1]),
    ];

    // for each clipping edge
    for (let i = 0; i < 4; i++) {
        const preClippedVertices2 = [];

        // for each edge on polygon
        for (let k = 0; k < preClippedVertices.length - 1; k++) {
            // clip polygon edge
            const a = preClippedVertices[k];
            const b = preClippedVertices[k + 1];

            const insideA = clippingEdges[i](a);
            const insideB = clippingEdges[i](b);

            if (insideA && insideB) {
                // case 1: both inside, push B vertex
                preClippedVertices2.push(b);
            } else if (insideA) {
                // case 2: just A outside, push intersection
                const intersectionPoint = clippingEdgeIntersectFn[i](a, b);
                preClippedVertices2.push(intersectionPoint);
            } else if (insideB) {
                // case 4: just B outside: push intersection, push B
                const intersectionPoint = clippingEdgeIntersectFn[i](a, b);
                preClippedVertices2.push(intersectionPoint);
                preClippedVertices2.push(b);
            } else {
                // case 3: both outside: do nothing
            }
        }
        if (preClippedVertices2.length) {
            preClippedVertices2.push(preClippedVertices2[0]);
        }
        preClippedVertices = preClippedVertices2;
    }

    if (preClippedVertices.length > 3) {
        if (isHole) {
            polygon.holes.push(polygon.flat.length / 2);
        }
        preClippedVertices.forEach(v => {
            polygon.flat.push(v[0], v[1]);
        });
    }

    return polygon;
}

function isClockWise(vertices) {
    let a = 0;
    for (let i = 0; i < vertices.length; i++) {
        let j = (i + 1) % vertices.length;
        a += vertices[i].x * vertices[j].y;
        a -= vertices[j].x * vertices[i].y;
    }
    return a > 0;
}

export default {
    clipPolygon,
    isClockWise
};
