import * as earcut from 'earcut';
import { isClipped, getLineNormal } from './utils';

/** 
 * Triangulate the polygon list (geometry)
 *      geom will be a list of polygons in which each polygon will have a flat array of vertices and a list of holes indices
 *      Example:
 *        let geometry = [
 *               {
 *                    flat: [
 *                        0.,0., 1.,0., 1.,1., 0.,1., 0.,0, //A square
 *                        0.25,0.25, 0.75,0.25, 0.75,0.75, 0.25,0.75, 0.25,0.25//A small square
 *                    ]
 *                    holes: [5]
 *                }
 *            ]
 */

export function decodePolygon(geometry) {
    let vertices = []; //Array of triangle vertices
    let normals = [];
    let breakpoints = []; // Array of indices (to vertexArray) that separate each feature

    geometry.forEach(feature => {
        feature.forEach(polygon => {
            const triangles = earcut(polygon.flat, polygon.holes);
            const trianglesLength = triangles.length;
            for (let i = 0; i < trianglesLength; i++) {
                const index = triangles[i];
                vertices.push(polygon.flat[2 * index], polygon.flat[2 * index + 1]);
                normals.push(0, 0);
            }

            const lineString = polygon.flat;
            for (let i = 0; i < lineString.length - 2; i += 2) {
                if (polygon.holes.includes((i + 2) / 2)) {
                    // Skip adding the line which connects two rings
                    continue;
                }

                const a = [lineString[i + 0], lineString[i + 1]];
                const b = [lineString[i + 2], lineString[i + 3]];

                if (isClipped(a) && isClipped(b)) {
                    continue;
                }

                let normal = getLineNormal(b, a);

                if (isNaN(normal[0]) || isNaN(normal[1])) {
                    // Skip when there is no normal vector
                    continue;
                }

                let na = normal;
                let nb = normal;

                // First triangle

                normals.push(-na[0], -na[1]);
                normals.push(na[0], na[1]);
                normals.push(-nb[0], -nb[1]);

                vertices.push(a[0], a[1]);
                vertices.push(a[0], a[1]);
                vertices.push(b[0], b[1]);

                // Second triangle

                normals.push(na[0], na[1]);
                normals.push(nb[0], nb[1]);
                normals.push(-nb[0], -nb[1]);

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
