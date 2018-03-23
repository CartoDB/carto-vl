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

    setStyle(style) {
        this.style = style;
    }

    getFeaturesAtPosition(pos) {
        switch (this.type) {
            case 'point':
                return this._getPointsAtPosition(pos);
            case 'line':
                return this._getLinesAtPosition(pos);
            case 'polygon':
                return this._getPolygonAtPosition(pos);
            default:
                return [];
        }
    }

    _getPointsAtPosition(pos) {
        console.log(pos);
        return [];
    }

    _getLinesAtPosition(pos) {
        console.log(pos);
        return [];

    }

    _getPolygonAtPosition(p) {
        p = wToR(p.x, p.y, { center: this.center, scale: this.scale });
        const vertices = this.decodedGeom.vertices;
        const breakpoints = this.decodedGeom.breakpoints;
        let featureID = 0;
        const features = [];
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
                    properties: this._getPropertiesOf(featureID)
                });
                // Don't repeat a feature if we the point is on an shared (by two triangles) edge
                // Also, don't waste CPU cycles
                i = breakpoints[featureID];
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

function sign(p1, p2, p3) {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

function pointInTriangle(pt, v1, v2, v3) {
    const b1 = sign(pt, v1, v2) < 0;
    const b2 = sign(pt, v2, v3) < 0;
    const b3 = sign(pt, v3, v1) < 0;

    return ((b1 == b2) && (b2 == b3));
}
