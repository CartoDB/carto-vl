import { getLineNormal, getJointNormal, getNormals } from './utils';

let vtmp = [0,0];
/**
 *  Generate the appropriate zero-sized, vertex-shader expanded triangle list with mitter joints.
 */
export function decodeLine(geometry) {
    let vertices = [];
    let normals = [];
    let breakpoints = []; // Array of indices (to vertexArray) that separate each feature
    
    geometry.map(feature => {
        feature.map(lineString => {
            // Create triangulation

            for (let i = 0; i < lineString.length - 2; i += 2) {
                const a = [lineString[i + 0], lineString[i + 1]];
                const b = [lineString[i + 2], lineString[i + 3]];
                const normal = getLineNormal(b, a);
                let na = normal;
                let nb = normal;
                
                if (i > 0) {
                    const prev = [lineString[i - 2], lineString[i - 1]];
                    na = getJointNormal(prev, a, b) || na;
                }
                if (i < lineString.length - 4) {
                    const next = [lineString[i + 4], lineString[i + 5]];
                    nb = getJointNormal(a, b, next) || nb;
                }

                const closed = true;

                const firstTrianglePoints = [ [-na[0], -na[1]], [na[0], na[1]], [-nb[0], -nb[1] ]]; 
                
                let firstTriangle = getNormals(firstTrianglePoints, closed, vtmp);
                normals.push(firstTriangle.n1[0], firstTriangle.n1[1]);
                normals.push(firstTriangle.n2[0], firstTriangle.n2[1]);
                normals.push(firstTriangle.n3[0], firstTriangle.n3[1]);

                vertices.push(a[0], a[1]);
                vertices.push(a[0], a[1]);
                vertices.push(b[0], b[1]);

                const secondTrianglePoints = [ [na[0], na[1]], [nb[0], nb[1]], [-nb[0], -nb[1]]]; 
                let secondTriangle = getNormals(secondTrianglePoints, closed, vtmp);
                
                normals.push(secondTriangle.n1[0], secondTriangle.n1[1]);
                normals.push(secondTriangle.n2[0], secondTriangle.n2[1]);
                normals.push(secondTriangle.n3[0], secondTriangle.n3[1]);

                vertices.push(a[0], a[1]);
                vertices.push(b[0], b[1]);
                vertices.push(b[0], b[1]);
            }
        });

        breakpoints.push(vertices.length);
    });

    return {
        vertices: new Float32Array(vertices),
        breakpoints,
        normals: new Float32Array(normals)
    };
}
