import decoder from './decoder';
import { wToR } from '../client/rsys';
import { triangleCollides } from '../../src/core/geometries/collision';
import { pointInTriangle, pointInCircle } from '../../src/utils/geometry';

// Maximum number of property textures that will be uploaded automatically to the GPU
// in a non-lazy manner
const MAX_GPU_AUTO_UPLOAD_TEXTURE_LIMIT = 32;

const aabbResults = {
    INSIDE: 1,
    OUTSIDE: -1,
    INTERSECTS: 0
};

export default class Dataframe {
    constructor ({ center, scale, geom, properties, type, active, size, metadata }) {
        this.active = active;
        this.center = center;
        this.geom = geom;
        this.properties = properties;
        this.scale = scale;
        this.type = type;
        this.decodedGeom = decoder.decodeGeom(this.type, this.geom);
        this.numVertex = type === 'point' ? size : this.decodedGeom.vertices.length / 2;
        this.numFeatures = type === 'point' ? size : this.decodedGeom.breakpoints.length || this.numVertex;
        this.propertyTex = [];
        this.metadata = metadata;
        this.propertyID = {}; // Name => PID
        this.propertyCount = 0;
        this._aabb = this._computeAABB(geom, type);
    }

    get widthScale () {
        return this.renderer
            ? (2 / this.renderer.gl.canvas.clientHeight) / this.scale * this.renderer._zoom
            : 1;
    }

    _computeAABB (geometry, type) {
        switch (type) {
            case 'point':
                return [];
            case 'line':
            case 'polygon':
                return this._computeFeatureAABB(geometry, type);
        }
    }

    _computeFeatureAABB (geometry, type) {
        const aabbList = [];

        for (let i = 0; i < geometry.length; i++) {
            const feature = geometry[i];

            const aabb = {
                minx: Number.POSITIVE_INFINITY,
                miny: Number.POSITIVE_INFINITY,
                maxx: Number.NEGATIVE_INFINITY,
                maxy: Number.NEGATIVE_INFINITY
            };

            for (let j = 0; j < feature.length; j++) {
                const { vertices, numVertices } = _getVerticesForGeometry(feature[j], type);

                for (let k = 0; k < numVertices; k++) {
                    aabb.minx = Math.min(aabb.minx, vertices[2 * k + 0]);
                    aabb.miny = Math.min(aabb.miny, vertices[2 * k + 1]);
                    aabb.maxx = Math.max(aabb.maxx, vertices[2 * k + 0]);
                    aabb.maxy = Math.max(aabb.maxy, vertices[2 * k + 1]);
                }
            }

            aabbList.push(aabb);
        }

        return aabbList;
    }

    setFreeObserver (freeObserver) {
        this.freeObserver = freeObserver;
    }

    bind (renderer) {
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
                while (i === breakpoints[index]) {
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

    getFeaturesAtPosition (pos, viz) {
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

    inViewport (featureIndex, scale, center, aspect, viz) {
        return this._geometryInViewport(featureIndex, scale, center, aspect, viz);
    }

    // Add new properties to the dataframe or overwrite previously stored ones.
    // `properties` is of the form: {propertyName: Float32Array}
    addProperties (properties) {
        Object.keys(properties).forEach(this._addProperty.bind(this));
    }

    getPropertyTexture (propertyName) {
        if (this.propertyTex[propertyName]) {
            return this.propertyTex[propertyName];
        }

        const propertiesFloat32Array = this.properties[propertyName];
        // Dataframe is already bound to this context, "hot update" it
        const gl = this.renderer.gl;
        const width = this.renderer.RTT_WIDTH;
        const height = Math.ceil(this.numFeatures / width);
        this.height = height;

        this.propertyTex[propertyName] = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.propertyTex[propertyName]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA,
            width, height, 0, gl.ALPHA, gl.FLOAT,
            propertiesFloat32Array);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        return this.propertyTex[propertyName];
    }

    free () {
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
        }
        const freeObserver = this.freeObserver;

        Object.keys(this).map(key => {
            this[key] = null;
        });

        this.freed = true;

        if (freeObserver) {
            freeObserver(this);
        }
    }

    _geometryInViewport (featureIndex, scale, center, aspect, viz) {
        const columnNames = Object.keys(this.properties);
        const feature = this._getFeature(columnNames, featureIndex);
        let strokeScale = 1;
        let stroke = 0;
        
        switch (this.type) {
            case 'point':
                return this._isPointInViewport(featureIndex, scale, center, aspect);
            case 'line':
                strokeScale = _computeScale(feature, viz.stroke, this.widthScale);
                stroke = viz.stroke.eval(feature) * strokeScale;
                return this._isPolygonInViewport(featureIndex, scale, strokeScale, stroke, center, aspect);
            case 'polygon':
                strokeScale = _computeScale(feature, viz.strokeWidth, this.widthScale);
                stroke = viz.strokeWidth.eval(feature) * strokeScale;
                return this._isPolygonInViewport(featureIndex, scale, strokeScale, stroke, center, aspect);
            default:
                return false;
        }
    }

    _isPointInViewport (featureIndex, scale, center, aspect) {
        const { minx, maxx, miny, maxy } = this._getBounds(scale, center, aspect);
        const x = this.geom[2 * featureIndex + 0];
        const y = this.geom[2 * featureIndex + 1];
        return x > minx && x < maxx && y > miny && y < maxy;
    }

    _isPolygonInViewport (featureIndex, scale, strokeScale, stroke, center, aspect) {
        const featureAABB = this._aabb[featureIndex];
        const viewportAABB = this._getBounds(scale, center, aspect);
        const aabbResult = this._compareAABBs(featureAABB, viewportAABB, strokeScale * stroke);
        const vertices = this.decodedGeom.vertices;
        const normals = this.decodedGeom.normals;
        const viewport = this._getViewportPoints(scale, center, aspect);

        if (aabbResult === aabbResults.INTERSECTS) {
            return _isPolygonCollidingViewport(vertices, normals, scale, viewport, viewportAABB);
        }

        return aabbResult === aabbResults.INSIDE;
    }

    _compareAABBs (featureAABB, viewportAABB, stroke) {
        const featureStrokeAABB = {
            minx: featureAABB.minx - stroke,
            miny: featureAABB.miny - stroke,
            maxx: featureAABB.maxx + stroke,
            maxy: featureAABB.maxy + stroke
        };

        switch (true) {
            case _isFeatureInsideViewport(featureStrokeAABB, viewportAABB):
                return aabbResults.INSIDE;
            case _isFeatureOutsideViewport(featureStrokeAABB, viewportAABB):
                return aabbResults.OUTSIDE;
            default:
                return aabbResults.INTERSECTS;
        }
    }

    _getBounds (scale, center, aspect) {
        this.vertexScale = [(scale / aspect) * this.scale, scale * this.scale];
        this.vertexOffset = [(scale / aspect) * (center.x - this.center.x), scale * (center.y - this.center.y)];

        const minx = (-1 + this.vertexOffset[0]) / this.vertexScale[0];
        const maxx = (1 + this.vertexOffset[0]) / this.vertexScale[0];
        const miny = (-1 + this.vertexOffset[1]) / this.vertexScale[1];
        const maxy = (1 + this.vertexOffset[1]) / this.vertexScale[1];

        return { minx, maxx, miny, maxy };
    }

    _getViewportPoints (scale, center, aspect) {
        this.vertexScale = [(scale / aspect) * this.scale, scale * this.scale];
        this.vertexOffset = [(scale / aspect) * (center.x - this.center.x), scale * (center.y - this.center.y)];

        const minx = (-1 + this.vertexOffset[0]) / this.vertexScale[0];
        const maxx = (1 + this.vertexOffset[0]) / this.vertexScale[0];
        const miny = (-1 + this.vertexOffset[1]) / this.vertexScale[1];
        const maxy = (1 + this.vertexOffset[1]) / this.vertexScale[1];

        return [
            [ minx, maxy ],
            [ maxx, maxy ],
            [ maxx, miny ],
            [ minx, miny ]
        ];
    }

    _getPointsAtPosition (pos, viz) {
        const p = wToR(pos.x, pos.y, {
            center: this.center,
            scale: this.scale
        });

        const points = this.decodedGeom.vertices;
        const features = [];
        // The viewport is in the [-1,1] range (on Y axis), therefore a pixel is equal to the range size (2) divided by the viewport height in pixels
        const widthScale = this.widthScale;
        const columnNames = Object.keys(this.properties);
        const vizWidth = viz.width;
        const vizStrokeWidth = viz.strokeWidth;

        for (let i = 0; i < points.length; i += 2) {
            const featureIndex = i / 2;
            const center = {
                x: points[i],
                y: points[i + 1]
            };

            const feature = this._getFeature(columnNames, featureIndex);

            if (this._isFeatureFiltered(feature, viz.filter)) {
                continue;
            }

            const pointWidth = vizWidth.eval(feature);
            const pointStrokeWidth = vizStrokeWidth.eval(feature);
            const diameter = Math.min(pointWidth + pointStrokeWidth, 126);

            // width and strokeWidth are diameters and scale is a radius, we need to divide by 2
            const scale = diameter / 2 * widthScale;
            if (!viz.symbol._default) {
                const offset = viz.symbolPlacement.eval();
                center.x += offset[0] * scale;
                center.y += offset[1] * scale;
            }

            const inside = pointInCircle(p, center, scale);

            if (inside) {
                features.push(this._getUserFeature(featureIndex));
            }
        }

        return features;
    }

    _getLinesAtPosition (pos, viz) {
        return this._getFeaturesFromTriangles(pos, viz.width, viz.filter);
    }

    _getPolygonAtPosition (pos, viz) {
        return this._getFeaturesFromTriangles(pos, viz.strokeWidth, viz.filter);
    }

    _getFeaturesFromTriangles (pos, widthExpression, filterExpression) {
        const p = wToR(pos.x, pos.y, {
            center: this.center,
            scale: this.scale
        });
        const vertices = this.decodedGeom.vertices;
        const normals = this.decodedGeom.normals;
        const breakpoints = this.decodedGeom.breakpoints;
        const features = [];
        // The viewport is in the [-1,1] range (on Y axis), therefore a pixel is equal to the range size (2) divided by the viewport height in pixels
        const widthScale = this.widthScale;
        const columnNames = Object.keys(this.properties);
        // Linear search for all features
        // Tests triangles since we already have the triangulated form
        // Moreover, with an acceleration structure and triangle testing features could be subdivided easily
        let featureIndex = -1;
        let scale;

        for (let i = 0; i < vertices.length; i += 6) {
            if (i === 0 || i >= breakpoints[featureIndex]) {
                featureIndex++;
                const feature = this._getFeature(columnNames, featureIndex);
                if (this._isFeatureFiltered(feature, filterExpression)) {
                    i = breakpoints[featureIndex] - 6;
                    continue;
                }

                scale = _computeScale(feature, widthExpression, widthScale);
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

    _getFeature (columnNames, featureIndex) {
        const feature = {};

        columnNames.forEach(name => {
            feature[name] = this.properties[name][featureIndex];
        });

        return feature;
    }

    _isFeatureFiltered (feature, filterExpression) {
        return filterExpression.eval(feature) < 0.5;
    }

    _getUserFeature (featureIndex) {
        let id;
        const properties = {};

        Object.keys(this.properties).map(propertyName => {
            let prop = this.properties[propertyName][featureIndex];
            const column = this.metadata.properties[propertyName];

            if (column && column.type === 'category') {
                prop = this.metadata.IDToCategory.get(prop);
            }

            if (propertyName === this.metadata.idProperty) {
                id = prop;
            }

            properties[propertyName] = prop;
        });

        return { id, properties };
    }

    _addProperty (propertyName) {
        if (Object.keys(this.propertyTex).length < MAX_GPU_AUTO_UPLOAD_TEXTURE_LIMIT) {
            this.getPropertyTexture(propertyName);
        }
    }

    _createStyleTileTexture (numFeatures) {
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
}

const _geometryFeature = {
    line: (feature) => {
        return {
            vertices: feature,
            numVertices: feature.length
        };
    },

    polygon: (feature) => {
        return {
            vertices: feature.flat,
            numVertices: feature.holes[0] || feature.flat.length / 2
        };
    }
};

function _getVerticesForGeometry (feature, geometryType) {
    return _geometryFeature[geometryType] ? _geometryFeature[geometryType](feature) : null;
}

function _isFeatureInsideViewport (featureAABB, viewportAABB) {
    return (featureAABB.minx >= viewportAABB.minx && featureAABB.maxx <= viewportAABB.maxx &&
            featureAABB.miny >= viewportAABB.miny && featureAABB.maxy <= viewportAABB.maxy);
}

function _isFeatureOutsideViewport (featureAABB, viewportAABB) {
    return (featureAABB.minx > viewportAABB.maxx || featureAABB.miny > viewportAABB.maxy ||
            featureAABB.maxx < viewportAABB.minx || featureAABB.maxy < viewportAABB.miny);
}

function _isPolygonCollidingViewport (vertices, normals, scale, viewport, viewportAABB) {
    for (let i = 0; i < vertices.length; i += 6) {
        const triangle = [
            [vertices[i + 0] + normals[i + 0] * scale, vertices[i + 1] + normals[i + 1] * scale],
            [vertices[i + 2] + normals[i + 2] * scale, vertices[i + 3] + normals[i + 3] * scale],
            [vertices[i + 4] + normals[i + 4] * scale, vertices[i + 5] + normals[i + 5] * scale],
            [vertices[i + 0] + normals[i + 0] * scale, vertices[i + 1] + normals[i + 1] * scale]
        ];

        if (triangleCollides(triangle, viewport, viewportAABB)) {
            return true;
        }
    }

    return false;
}

function _computeScale (feature, widthExpression, widthScale) {
    // Width is saturated at 336px
    const width = Math.min(widthExpression.eval(feature), 336);
    // width is a diameter and scale is radius-like, we need to divide by 2
    return width / 2 * widthScale;
}
