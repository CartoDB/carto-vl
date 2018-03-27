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
    }

    bind(renderer) {
        const gl = renderer.gl;
        this.renderer = renderer;

        const vertices = this.decodedGeom.vertices;
        const breakpoints = this.decodedGeom.breakpoints;

        this._genDataframePropertyTextures(gl);

        const width = this.renderer.RTT_WIDTH;
        const height = Math.ceil(this.numFeatures / width);

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
            if ((!breakpoints.length && i > 0) || i == breakpoints[index]) {
                index++;
            }
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

    getFeaturesAtPosition(pos, style) {
        switch (this.type) {
            case 'point':
                return this._getPointsAtPosition(pos, style);
            case 'line':
                return this._getLinesAtPosition(pos, style);
            case 'polygon':
                return this._getPolygonAtPosition(pos, style);
            default:
                return [];
        }
    }

    _getPointsAtPosition(p, style) {
        p = wToR(p.x, p.y, { center: this.center, scale: this.scale });
        const points = this.decodedGeom.vertices;
        const features = [];
        // The viewport is in the [-1,1] range (on Y axis), therefore a pixel is equal to the range size (2) divided by the viewport height in pixels
        const widthScale = (2 / this.renderer.gl.canvas.height) / this.scale * this.renderer._zoom;
        const columnNames = Object.keys(this.properties);
        const styleWidth = style.getWidth();
        const styleStrokeWidth = style.getStrokeWidth();
        for (let i = 0; i < points.length; i += 2) {
            const featureID = i / 2;
            const center = {
                x: points[i],
                y: points[i + 1],
            };
            const f = {};
            columnNames.forEach(name => {
                f[name] = this.properties[name][featureID];
            });
            // width and strokeWidth are diameters and scale is a radius, we need to divide by 2
            const scale = (styleWidth.eval(f) + styleStrokeWidth.eval(f)) / 2 * widthScale;
            const inside = pointInCircle(p, center, scale);
            if (inside) {
                features.push({
                    properties: this._getPropertiesOf(featureID)
                });
            }
        }
        return features;
    }

    _getLinesAtPosition(pos, style) {
        const p = wToR(pos.x, pos.y, { center: this.center, scale: this.scale });
        const vertices = this.decodedGeom.vertices;
        const normals = this.decodedGeom.normals;
        const breakpoints = this.decodedGeom.breakpoints;
        let featureID = 0;
        const features = [];
        // The viewport is in the [-1,1] range (on Y axis), therefore a pixel is equal to the range size (2) divided by the viewport height in pixels        
        const widthScale = 2 / this.renderer.gl.canvas.height / this.scale * this.renderer._zoom;
        const columnNames = Object.keys(this.properties);
        const styleWidth = style.getWidth();
        // Linear search for all features
        // Tests triangles instead of polygons since we already have the triangulated form
        // Moreover, with an acceleration structure and triangle testing features can be subdivided easily
        for (let i = 0; i < vertices.length; i += 6) {
            if (i >= breakpoints[featureID]) {
                featureID++;
            }
            const f = {};
            columnNames.forEach(name => {
                f[name] = this.properties[name][featureID];
            });
            // width is a diameter and scale is radius-like, we need to divide by 2
            const scale = styleWidth.eval(f) / 2 * widthScale;
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
                features.push({
                    properties: this._getPropertiesOf(featureID)
                });
                // Don't repeat a feature if we the point is on a shared (by two triangles) edge
                // Also, don't waste CPU cycles
                i = breakpoints[featureID] - 6;
            }
        }
        return features;

    }

    _getPolygonAtPosition(p) {
        p = wToR(p.x, p.y, { center: this.center, scale: this.scale });
        const vertices = this.decodedGeom.vertices;
        const breakpoints = this.decodedGeom.breakpoints;
        let featureID = 0;
        const features = [];
        // Linear search for all features
        // Tests triangles instead of polygons since we already have the triangulated form
        // Moreover, with an acceleration structure and triangle testing features can be subdivided easily
        for (let i = 0; i < vertices.length; i += 6) {
            if (i >= breakpoints[featureID]) {
                featureID++;
            }
            const v1 = {
                x: vertices[i + 0],
                y: vertices[i + 1]
            };
            const v2 = {
                x: vertices[i + 2],
                y: vertices[i + 3]
            };
            const v3 = {
                x: vertices[i + 4],
                y: vertices[i + 5]
            };
            const inside = pointInTriangle(p, v1, v2, v3);
            if (inside) {
                features.push({
                    id: featureID,
                    properties: this._getPropertiesOf(featureID)
                });
                // Don't repeat a feature if we the point is on a shared (by two triangles) edge
                // Also, don't waste CPU cycles
                i = breakpoints[featureID] - 6;
            }
        }
        return features;
    }

    _getPropertiesOf(featureID) {
        const properties = {};
        Object.keys(this.properties).map(propertyName => {
            let prop = this.properties[propertyName][featureID];
            const column = this.metadata.columns.find(c => c.name == propertyName);
            if (column.type == 'category') {
                prop = column.categoryNames[prop];
            }
            properties[propertyName] = prop;
        });
        return properties;
    }

    _genDataframePropertyTextures() {
        const gl = this.renderer.gl;
        const width = this.renderer.RTT_WIDTH;
        const height = Math.ceil(this.numFeatures / width);

        this.height = height;
        this.propertyID = {}; //Name => PID
        this.propertyCount = 0;
        for (const k in this.properties) {
            if (this.properties.hasOwnProperty(k) && this.properties[k].length > 0) {
                let propertyID = this.propertyID[k];
                if (propertyID === undefined) {
                    propertyID = this.propertyCount;
                    this.propertyCount++;
                    this.propertyID[k] = propertyID;
                }
                this.propertyTex[propertyID] = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, this.propertyTex[propertyID]);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA,
                    width, height, 0, gl.ALPHA, gl.FLOAT,
                    this.properties[k]);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            }
        }
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
function pointInTriangle(p, v1, v2, v3) {
    // https://stackoverflow.com/questions/2049582/how-to-determine-if-a-point-is-in-a-2d-triangle
    // contains an explanation of both this algorithm and one based on barycentric coordinates,
    // which could be faster, but, nevertheless, it is quite similar in terms of required arithmetic operations

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

function pointInCircle(p, center, scale) {
    const diff = {
        x: p.x - center.x,
        y: p.y - center.y
    };
    const lengthSquared = diff.x * diff.x + diff.y * diff.y;
    return lengthSquared <= scale * scale;
}
