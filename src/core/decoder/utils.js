/* Cohen–Sutherland line clipping algorithm */
export function isClipped(line) {
    return line[0] == -1 || line[0] == 1 || line[1] == -1 || line[1] == 1;
}

export function getLineNormal(a, b) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    return normalize([-dy, dx]);
}

export function getJointNormal(a, b, c) {
    const u = normalize([a[0] - b[0], a[1] - b[1]]);
    const v = normalize([c[0] - b[0], c[1] - b[1]]);
    const sin = - u[1] * v[0] + u[0] * v[1];
    if (sin !== 0) {
        return [(u[0] + v[0]) / sin, (u[1] + v[1]) / sin];
    }
}

export function subtract(v, va, vb) {
    v[0] = va[0] - vb[0];
    v[1] = va[1] - vb[1];
    return v;
}

export function direction(v, va, vb) {
    subtract(v, va, vb);
    normalizeVectors(v, v);
    return v;
}

export function normalize(v) {
    const s = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    v[0] = v[0] / s;
    v[1] = v[1] / s;
    return v;
}

export function normalizeVectors(out, a) {
    const x = a[0];
    const y = a[1];
    let len = x*x + y*y;
    
    if (len > 0) {
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
    }

    return out;
}

export function set(v, x, y) {
    v[0] = x;
    v[1] = y;
    return v;
}

export function normal(v, vdir) {
    set(v, -vdir[1], vdir[0]);
    return v;
}

export function computeMiter(tangent, miter, va, vb, halfThick, vtmp) {
    add(tangent, va, vb);
    normalizeVectors(tangent, tangent);

    set(miter, -tangent[1], tangent[0]);
    set(vtmp, -va[1], vb[0]);

    return halfThick / dot(miter, vtmp);
}

export function dot(va, vb) {
    return va[0] * vb[0] + va[1] * vb[1];
}

export function add(v, va, vb) {
    v[0] = va[0] + vb[0];
    v[1] = va[1] + vb[1];
    return v;
}

export function getNormals (points, closed, vtmp=[0,0], lineA=[0,0], lineB=[0,0], tangent=[0,0], miter=[0,0]) {
    const v = [];
    
    let curNormal = null;
    
    if (closed) {
        points = points.slice();
        points.push(points[0]);
    }

    const total = points.length;

    for (let i = 1; i<total; i++) {
        const last = points[i-1];
        const cur = points[i];
        const next = i < total - 1 ? points[i+1] : null;

        direction(lineA, cur, last);

        if (!curNormal)  {
            curNormal = [0, 0];
            normal(curNormal, lineA);
        }

        if (i === 1) //add initial normals
            addNext(v, curNormal, 1);

        if (!next) { //no miter, simple segment
            normal(curNormal, lineA); //reset normal
            addNext(v, curNormal, 1);
        } else { //miter with last
            //get unit dir of next line
            direction(lineB, next, cur);

            //stores tangent & miter
            const miterLen = computeMiter(tangent, miter, lineA, lineB, 1, vtmp);
            addNext(v, miter, miterLen);
        }
    }

    //if the polyline is a closed loop, clean up the last normal
    if (total > 2 && closed) {
        const last2 = points[total-2];
        const cur2 = points[0];
        const next2 = points[1];

        direction(lineA, cur2, last2);
        direction(lineB, next2, cur2);
        normal(curNormal, lineA);
        
        const miterLen2 = computeMiter(tangent, miter, lineA, lineB, 1, vtmp);
        v[0][0] = miter.slice();
        v[total-1][0] = miter.slice();
        v[0][1] = miterLen2;
        v[total-1][1] = miterLen2;
        v.pop();
    }

    return {
        n1: v[0][0],
        n2: v[1][0],
        n3: v[2][0]
    };
}

function addNext(v, normal, length) {
    v.push([[normal[0], normal[1]], length]);
}
