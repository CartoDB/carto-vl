import decoder from './decoder';
import { wToR } from '../client/rsys';

export default class Dataframe {
    // `type` is one of 'point' or 'line' or 'polygon'
    constructor({ center, scale, geom, properties, type, active, size, metadata }) {
        this.active = active;
        this.center = center;
        this.geom = geom;
        this.properties = properties;
        this.scale = scale;
        this.size = size;
        this.type = type;
        this.decodedGeom = decoder.decodeGeom(this.type, this.geom);
        this.numVertex = this.decodedGeom.vertices.length / 2;
        this.numFeatures = this.decodedGeom.breakpoints.length || this.numVertex;
        this.propertyTex = [];
        this.metadata = metadata;
        this.propertyID = {}; //Name => PID
        this.propertyCount = 0;
        if (this.type == 'polygon') {
            this._aabb = [];
            geom.forEach(feature => {
                const aabb = {
                    minx: Number.POSITIVE_INFINITY,
                    miny: Number.POSITIVE_INFINITY,
                    maxx: Number.NEGATIVE_INFINITY,
                    maxy: Number.NEGATIVE_INFINITY,
                };
                feature.forEach(polygon => {
                    const vertices = polygon.flat;
                    const numVertices = polygon.holes[0] || polygon.flat.length / 2;
                    for (let i = 0; i < numVertices; i++) {
                        aabb.minx = Math.min(aabb.minx, vertices[2 * i + 0]);
                        aabb.miny = Math.min(aabb.miny, vertices[2 * i + 1]);
                        aabb.maxx = Math.max(aabb.maxx, vertices[2 * i + 0]);
                        aabb.maxy = Math.max(aabb.maxy, vertices[2 * i + 1]);
                    }
                });
                this._aabb.push(aabb);
            });
        } else if (this.type == 'line') {
            this._aabb = [];
            geom.forEach(feature => {
                const aabb = {
                    minx: Number.POSITIVE_INFINITY,
                    miny: Number.POSITIVE_INFINITY,
                    maxx: Number.NEGATIVE_INFINITY,
                    maxy: Number.NEGATIVE_INFINITY,
                };
                feature.forEach(line => {
                    const vertices = line;
                    const numVertices = line.length;
                    for (let i = 0; i < numVertices; i++) {
                        aabb.minx = Math.min(aabb.minx, vertices[2 * i + 0]);
                        aabb.miny = Math.min(aabb.miny, vertices[2 * i + 1]);
                        aabb.maxx = Math.max(aabb.maxx, vertices[2 * i + 0]);
                        aabb.maxy = Math.max(aabb.maxy, vertices[2 * i + 1]);
                    }
                });
                this._aabb.push(aabb);
            });
        }
    }

    bind(renderer) {
        const gl = renderer.gl;
        this.renderer = renderer;

        const vertices = this.decodedGeom.vertices;
        const breakpoints = this.decodedGeom.breakpoints;

        this.addProperties(this.properties);

        const width = this.renderer.RTT_WIDTH;
        const height = Math.ceil(this.numFeatures / width);
        this.height = height;

        this.vertexBuffer = gl.createBuffer();
        this.featureIDBuffer = gl.createBuffer();

        this.texColor = this._createStyleTileTexture(this.numFeatures);
        this.texWidth = this._createStyleTileTexture(this.numFeatures);
        this.texStrokeColor = this._createStyleTileTexture(this.numFeatures);
        this.texStrokeWidth = this._createStyleTileTexture(this.numFeatures);
        this.texFilter = this._createStyleTileTexture(this.numFeatures);

        const ids = new Float32Array(vertices.length);
        let index = 0;
        for (let i = 0; i < vertices.length; i += 2) {
            if (!breakpoints.length) {
                if (i > 0) {
                    index++;
                }
            } else {
                while (i == breakpoints[index]) {
                    index++;
                }
            }
            // Transform integer ID into a `vec2` to overcome WebGL 1 limitations, output IDs will be in the `vec2([0,1], [0,1])` range
            ids[i + 0] = ((index) % width) / (width - 1);
            ids[i + 1] = height > 1 ? Math.floor((index) / width) / (height - 1) : 0.5;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        if (this.decodedGeom.normals) {
            this.normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.decodedGeom.normals, gl.STATIC_DRAW);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.featureIDBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, ids, gl.STATIC_DRAW);
    }

    getFeaturesAtPosition(pos, viz) {
        switch (this.type) {
            case 'point':
                return this._getPointsAtPosition(pos, viz);
            case 'line':
                return this._getLinesAtPosition(pos, viz);
            case 'polygon':
                return this._getPolygonAtPosition(pos, viz);
            default:
                return [];
        }
    }

    inViewport(featureIndex, minx, miny, maxx, maxy) {
        switch (this.type) {
            case 'point':
            {
                const x = this.geom[2 * featureIndex + 0];
                const y = this.geom[2 * featureIndex + 1];
                return x > minx && x < maxx && y > miny && y < maxy;
            }
            case 'line':
            case 'polygon':
            {
                const aabb = this._aabb[featureIndex];
                return !(minx > aabb.maxx || maxx < aabb.minx || miny > aabb.maxy || maxy < aabb.miny);

            }
            default:
                return false;
        }
    }

    _getPointsAtPosition(p, viz) {
        p = wToR(p.x, p.y, { center: this.center, scale: this.scale });
        const points = this.decodedGeom.vertices;
        const features = [];
        // The viewport is in the [-1,1] range (on Y axis), therefore a pixel is equal to the range size (2) divided by the viewport height in pixels
        const widthScale = (2 / this.renderer.gl.canvas.clientHeight) / this.scale * this.renderer._zoom;
        const columnNames = Object.keys(this.properties);
        const vizWidth = viz.width;
        const vizStrokeWidth = viz.strokeWidth;

        for (let i = 0; i < points.length; i += 2) {
            const featureIndex = i / 2;
            const center = {
                x: points[i],
                y: points[i + 1],
            };
            const f = this._getFeature(columnNames, featureIndex);
            if (this._isFeatureFiltered(f, viz.filter)) {
                continue;
            }
            const pointWidth = vizWidth.eval(f);
            const pointStrokeWidth = vizStrokeWidth.eval(f);
            const diameter = Math.min(pointWidth + pointStrokeWidth, 126);

            // width and strokeWidth are diameters and scale is a radius, we need to divide by 2
            const scale = diameter / 2 * widthScale;
            const inside = pointInCircle(p, center, scale);
            if (inside) {
                features.push(this._getUserFeature(featureIndex));
            }
        }
        return features;
    }

    _getLinesAtPosition(pos, viz) {
        return this._getFeaturesFromTriangles(pos, viz.width, viz.filter);
    }
    _getPolygonAtPosition(pos, viz) {
        return this._getFeaturesFromTriangles(pos, viz.strokeWidth, viz.filter);
    }
    _getFeaturesFromTriangles(pos, widthExpression, filterExpression) {
        const p = wToR(pos.x, pos.y, { center: this.center, scale: this.scale });
        const vertices = this.decodedGeom.vertices;
        const normals = this.decodedGeom.normals;
        const breakpoints = this.decodedGeom.breakpoints;
        const features = [];
        // The viewport is in the [-1,1] range (on Y axis), therefore a pixel is equal to the range size (2) divided by the viewport height in pixels
        const widthScale = (2 / this.renderer.gl.canvas.clientHeight) / this.scale * this.renderer._zoom;
        const columnNames = Object.keys(this.properties);
        // Linear search for all features
        // Tests triangles since we already have the triangulated form
        // Moreover, with an acceleration structure and triangle testing features could be subdivided easily
        let featureIndex = -1;
        let scale;
        let computeScale = feature => {
            // Width is saturated at 336px
            const width = Math.min(widthExpression.eval(feature), 336);
            // width is a diameter and scale is radius-like, we need to divide by 2
            scale = width / 2 * widthScale;
        };
        for (let i = 0; i < vertices.length; i += 6) {
            if (i == 0 || i >= breakpoints[featureIndex]) {
                featureIndex++;
                const feature = this._getFeature(columnNames, featureIndex);
                if (this._isFeatureFiltered(feature, filterExpression)) {
                    i = breakpoints[featureIndex] - 6;
                    continue;
                }
                computeScale(feature);
            }
            const v1 = {
                x: vertices[i + 0] + normals[i + 0] * scale,
                y: vertices[i + 1] + normals[i + 1] * scale
            };
            const v2 = {
                x: vertices[i + 2] + normals[i + 2] * scale,
                y: vertices[i + 3] + normals[i + 3] * scale
            };
            const v3 = {
                x: vertices[i + 4] + normals[i + 4] * scale,
                y: vertices[i + 5] + normals[i + 5] * scale
            };
            const inside = pointInTriangle(p, v1, v2, v3);
            if (inside) {
                features.push(this._getUserFeature(featureIndex));
                // Don't repeat a feature if we the point is on a shared (by two triangles) edge
                // Also, don't waste CPU cycles
                i = breakpoints[featureIndex] - 6;
            }
        }
        return features;
    }

    _getFeature(columnNames, featureIndex) {
        const f = {};
        columnNames.forEach(name => {
            f[name] = this.properties[name][featureIndex];
        });
        return f;
    }
    _isFeatureFiltered(feature, filterExpression) {
        const isFiltered = filterExpression.eval(feature) < 0.5;
        return isFiltered;
    }

    _getUserFeature(featureIndex) {
        let id = '';
        const properties = {};
        Object.keys(this.properties).map(propertyName => {
            let prop = this.properties[propertyName][featureIndex];
            if (propertyName === 'cartodb_id') {
                id = prop;
            } else {
                const column = this.metadata.columns.find(c => c.name == propertyName);
                if (column && column.type == 'category') {
                    prop = this.metadata.categoryIDsToName[prop];
                }
                properties[propertyName] = prop;
            }
        });
        return { id, properties };
    }

    _addProperty(propertyName, propertiesFloat32Array) {
        if (!this.renderer) {
            // Properties will be bound to the GL context on the initial this.bind() call
            return;
        }
        // Dataframe is already bound to this context, "hot update" it
        const gl = this.renderer.gl;
        const width = this.renderer.RTT_WIDTH;
        const height = Math.ceil(this.numFeatures / width);
        this.height = height;

        let propertyID = this.propertyID[propertyName];
        if (propertyID === undefined) {
            propertyID = this.propertyCount;
            this.propertyCount++;
            this.propertyID[propertyName] = propertyID;
        }
        this.propertyTex[propertyID] = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.propertyTex[propertyID]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA,
            width, height, 0, gl.ALPHA, gl.FLOAT,
            propertiesFloat32Array);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    // Add new properties to the dataframe or overwrite previously stored ones.
    // `properties` is of the form: {propertyName: Float32Array}
    addProperties(properties) {
        Object.keys(properties).forEach(propertyName => {
            this._addProperty(propertyName, properties[propertyName]);
            this.properties[propertyName] = properties[propertyName];
        });
    }

    _createStyleTileTexture(numFeatures) {
        // TODO we are wasting 75% of the memory for the scalar attributes (width, strokeWidth),
        // since RGB components are discarded
        const gl = this.renderer.gl;
        const width = this.renderer.RTT_WIDTH;
        const height = Math.ceil(numFeatures / width);
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
            width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        return texture;
    }

    free() {
        if (this.propertyTex) {
            const gl = this.renderer.gl;
            this.propertyTex.map(tex => gl.deleteTexture(tex));
            gl.deleteTexture(this.texColor);
            gl.deleteTexture(this.texStrokeColor);
            gl.deleteTexture(this.texWidth);
            gl.deleteTexture(this.texStrokeWidth);
            gl.deleteTexture(this.texFilter);
            gl.deleteBuffer(this.vertexBuffer);
            gl.deleteBuffer(this.featureIDBuffer);
            this.texColor = 'freed';
            this.texWidth = 'freed';
            this.texStrokeColor = 'freed';
            this.texStrokeWidth = 'freed';
            this.texFilter = 'freed';
            this.vertexBuffer = 'freed';
            this.featureIDBuffer = 'freed';
            this.propertyTex = null;
        }
    }
}

// Returns true if p is inside the triangle or on a triangle's edge, false otherwise
// Parameters in {x: 0, y:0} form
export function pointInTriangle(p, v1, v2, v3) {
    // https://stackoverflow.com/questions/2049582/how-to-determine-if-a-point-is-in-a-2d-triangle
    // contains an explanation of both this algorithm and one based on barycentric coordinates,
    // which could be faster, but, nevertheless, it is quite similar in terms of required arithmetic operations

    if (equal(v1, v2) || equal(v2, v3) || equal(v3, v1)) {
        // Avoid zero area triangle
        return false;
    }

    // A point is inside a triangle or in one of the triangles edges
    // if the point is in the three half-plane defined by the 3 edges
    const b1 = halfPlaneTest(p, v1, v2) < 0;
    const b2 = halfPlaneTest(p, v2, v3) < 0;
    const b3 = halfPlaneTest(p, v3, v1) < 0;

    return (b1 == b2) && (b2 == b3);
}

// Tests if a point `p` is in the half plane defined by the line with points `a` and `b`
// Returns a negative number if the result is INSIDE, returns 0 if the result is ON_LINE,
// returns >0 if the point is OUTSIDE
// Parameters in {x: 0, y:0} form
function halfPlaneTest(p, a, b) {
    // We use the cross product of `PB x AB` to get `sin(angle(PB, AB))`
    // The result's sign is the half plane test result
    return (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
}

function equal(a, b) {
    return (a.x == b.x) && (a.y == b.y);
}

function pointInCircle(p, center, scale) {
    const diff = {
        x: p.x - center.x,
        y: p.y - center.y
    };
    const lengthSquared = diff.x * diff.x + diff.y * diff.y;
    return lengthSquared <= scale * scale;
}
