const bits = {
    TOP: 8,
    BOTTOM: 4,
    RIGHT: 2,
    LEFT: 1
};

/* Sutherland-Hodgeman polygon clipping algorithm
* https://en.wikipedia.org/wiki/Sutherland%E2%80%93Hodgman_algorithm
* https://github.com/mapbox/lineclip
**/
export function polygonClip (points, bbox) {
    let result, prev, prevInside, i, p, inside;

    for (let edge = 1; edge <= 8; edge *= 2) {
        result = [];
        prev = points[points.length - 1];
        prevInside = !(_bitCode(prev, bbox) & edge);

        for (i = 0; i < points.length; i++) {
            p = points[i];
            inside = !(_bitCode(p, bbox) & edge);

            if (inside !== prevInside) {
                result.push(_intersect(prev, p, edge, bbox));
            }

            if (inside) {
                result.push(p);
            }

            prev = p;
            prevInside = inside;
        }

        points = result;

        if (!points.length) {
            break;
        }
    }

    return result;
}

export function triangleCollides (trianglePoints, bbox) {
    return polygonClip(trianglePoints, bbox).length !== 0;
}

function _intersect (a, b, edge, bbox) {
    if (edge & bits.TOP) {
        return _top(a, b, bbox);
    }

    if (edge & bits.BOTTOM) {
        return _bottom(a, b, bbox);
    }

    if (edge & bits.RIGHT) {
        return _right(a, b, bbox);
    }

    if (edge & bits.LEFT) {
        return _left(a, b, bbox);
    }

    return null;
}

function _top (a, b, bbox) {
    return [ a[0] + (b[0] - a[0]) * (bbox[3] - a[1]) / (b[1] - a[1]), bbox[3] ];
}

function _bottom (a, b, bbox) {
    return [ a[0] + (b[0] - a[0]) * (bbox[1] - a[1]) / (b[1] - a[1]), bbox[1] ];
}

function _right (a, b, bbox) {
    return [ bbox[2], a[1] + (b[1] - a[1]) * (bbox[2] - a[0]) / (b[0] - a[0]) ];
}

function _left (a, b, bbox) {
    return [ bbox[0], a[1] + (b[1] - a[1]) * (bbox[0] - a[0]) / (b[0] - a[0]) ];
}

// bit code reflects the point position relative to the bbox:

//         left  mid  right
//    top  1001  1000  1010
//    mid  0001  0000  0010
// bottom  0101  0100  0110

function _bitCode (point, bbox) {
    let bitCode = 0;

    if (point[0] < bbox[0]) {
        bitCode |= bits.LEFT;
    } else if (point[0] > bbox[2]) {
        bitCode |= bits.RIGHT;
    }

    if (point[1] < bbox[1]) {
        bitCode |= bits.BOTTOM;
    } else if (point[1] > bbox[3]) {
        bitCode |= bits.TOP;
    }

    return bitCode;
}
