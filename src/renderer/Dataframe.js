import decoder from './decoder';
import { wToR } from '../client/rsys';
import { triangleCollides } from '../../src/core/geometries/collision';
import { pointInTriangle, pointInCircle } from '../../src/utils/geometry';

// Maximum number of property textures that will be uploaded automatically to the GPU
// in a non-lazy manner
const MAX_GPU_AUTO_UPLOAD_TEXTURE_LIMIT = 32;

const AABBTestResults = {
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
                const aabbList = [];

                for (let i = 0; i < geometry.length; i++) {
                    const feature = geometry[i];

                    let aabb = {
                        minx: Number.POSITIVE_INFINITY,
                        miny: Number.POSITIVE_INFINITY,
                        maxx: Number.NEGATIVE_INFINITY,
                        maxy: Number.NEGATIVE_INFINITY
                    };

                    for (let j = 0; j < feature.length; j++) {
                        aabb = _updateAABBForGeometry(feature[j], aabb, type);
                    }

                    aabbList.push(aabb);
                }

                return aabbList;
        }
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
                return this._getFeaturesFromTriangles('line', pos, viz);
            case 'polygon':
                return this._getFeaturesFromTriangles('polygon', pos, viz);
            default:
                return [];
        }
    }

    inViewport (featureIndex, renderScale, center, aspect, viz) {
        const feature = this.getFeature(featureIndex);
        const viewportAABB = this._getBounds(renderScale, center, aspect);
        let strokeWidthScale = 1;

        switch (this.type) {
            case 'point':
                return this._isPointInViewport(featureIndex, viewportAABB);
            case 'line':
                strokeWidthScale = this._computeLineWidthScale(feature, viz);
                return this._isPolygonInViewport(featureIndex, viewportAABB, strokeWidthScale);
            case 'polygon':
                strokeWidthScale = this._computePolygonWidthScale(feature, viz);
                return this._isPolygonInViewport(featureIndex, viewportAABB, strokeWidthScale);
            default:
                return false;
        }
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

    _isPointInViewport (featureIndex, viewportAABB) {
        const { minx, maxx, miny, maxy } = viewportAABB;
        const x = this.geom[2 * featureIndex + 0];
        const y = this.geom[2 * featureIndex + 1];
        return x > minx && x < maxx && y > miny && y < maxy;
    }

    _isPolygonInViewport (featureIndex, viewportAABB, strokeWidthScale) {
        const featureAABB = this._aabb[featureIndex];
        const aabbResult = this._compareAABBs(featureAABB, viewportAABB, strokeWidthScale);
        const vertices = this.decodedGeom.vertices;
        const normals = this.decodedGeom.normals;

        if (aabbResult === AABBTestResults.INTERSECTS) {
            return _isPolygonCollidingViewport(vertices, normals, strokeWidthScale, viewportAABB);
        }

        return aabbResult === AABBTestResults.INSIDE;
    }

    _compareAABBs (featureAABB, viewportAABB, stroke) {
        const featureStrokeAABB = {
            minx: featureAABB.minx - stroke,
            miny: featureAABB.miny - stroke,
            maxx: featureAABB.maxx + stroke,
            maxy: featureAABB.maxy + stroke
        };

        switch (true) {
            case _isFeatureAABBInsideViewport(featureStrokeAABB, viewportAABB):
                return AABBTestResults.INSIDE;
            case _isFeatureAABBOutsideViewport(featureStrokeAABB, viewportAABB):
                return AABBTestResults.OUTSIDE;
            default:
                return AABBTestResults.INTERSECTS;
        }
    }

    _getBounds (renderScale, center, aspect) {
        this.vertexScale = [(renderScale / aspect) * this.scale, renderScale * this.scale];
        this.vertexOffset = [(renderScale / aspect) * (center.x - this.center.x), renderScale * (center.y - this.center.y)];

        const minx = (-1 + this.vertexOffset[0]) / this.vertexScale[0];
        const maxx = (1 + this.vertexOffset[0]) / this.vertexScale[0];
        const miny = (-1 + this.vertexOffset[1]) / this.vertexScale[1];
        const maxy = (1 + this.vertexOffset[1]) / this.vertexScale[1];

        return { minx, maxx, miny, maxy };
    }

    _getPointsAtPosition (pos, viz) {
        const p = wToR(pos.x, pos.y, {
            center: this.center,
            scale: this.scale
        });

        const points = this.decodedGeom.vertices;
        const features = [];

        for (let i = 0; i < points.length; i += 2) {
            const featureIndex = i / 2;
            const center = {
                x: points[i],
                y: points[i + 1]
            };

            const feature = this.getFeature(featureIndex);

            if (this._isFeatureFiltered(feature, viz.filter)) {
                continue;
            }

            const strokeWidthScale = this._computePointWidthScale(feature, viz);

            if (!viz.symbol._default) {
                const offset = viz.symbolPlacement.eval();
                center.x += offset[0] * strokeWidthScale;
                center.y += offset[1] * strokeWidthScale;
            }

            const inside = pointInCircle(p, center, strokeWidthScale);

            if (inside) {
                features.push(this.getFeature(featureIndex));
            }
        }

        return features;
    }

    _getFeaturesFromTriangles (geometryType, pos, viz) {
        const p = wToR(pos.x, pos.y, {
            center: this.center,
            scale: this.scale
        });

        const vertices = this.decodedGeom.vertices;
        const normals = this.decodedGeom.normals;
        const breakpoints = this.decodedGeom.breakpoints;
        const features = [];
        // Linear search for all features
        // Tests triangles since we already have the triangulated form
        // Moreover, with an acceleration structure and triangle testing features could be subdivided easily
        let featureIndex = -1;
        let strokeWidthScale;

        for (let i = 0; i < vertices.length; i += 6) {
            if (i === 0 || i >= breakpoints[featureIndex]) {
                featureIndex++;
                const feature = this.getFeature(featureIndex);

                if (this._isFeatureFiltered(feature, viz.filter)) {
                    i = breakpoints[featureIndex] - 6;
                    continue;
                }

                strokeWidthScale = geometryType === 'line'
                    ? this._computeLineWidthScale(feature, viz)
                    : this._computePolygonWidthScale(feature, viz);
            }

            const v1 = {
                x: vertices[i + 0] + normals[i + 0] * strokeWidthScale,
                y: vertices[i + 1] + normals[i + 1] * strokeWidthScale
            };

            const v2 = {
                x: vertices[i + 2] + normals[i + 2] * strokeWidthScale,
                y: vertices[i + 3] + normals[i + 3] * strokeWidthScale
            };

            const v3 = {
                x: vertices[i + 4] + normals[i + 4] * strokeWidthScale,
                y: vertices[i + 5] + normals[i + 5] * strokeWidthScale
            };

            const inside = pointInTriangle(p, v1, v2, v3);

            if (inside) {
                features.push(this.getFeature(featureIndex));
                // Don't repeat a feature if we the point is on a shared (by two triangles) edge
                // Also, don't waste CPU cycles
                i = breakpoints[featureIndex] - 6;
            }
        }

        return features;
    }

    _isFeatureFiltered (feature, filterExpression) {
        return filterExpression.eval(feature) < 0.5;
    }

    getFeature (index) {
        if (!this.cachedFeatures) {
            this.cachedFeatures = [];
        }

        if (this.cachedFeatures[index] !== undefined) {
            return this.cachedFeatures[index];
        }

        const feature = {};
        const propertyNames = Object.keys(this.properties);
        for (let i = 0; i < propertyNames.length; i++) {
            const name = propertyNames[i];
            if (this.metadata.properties[name].type === 'category') {
                feature[name] = this.metadata.IDToCategory.get(this.properties[name][index]);
            } else {
                feature[name] = this.properties[name][index];
            }
        }

        this.cachedFeatures[index] = feature;
        return feature;
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

    _computePointWidthScale (feature, viz) {
        const SATURATION_PX = 126;
        const diameter = Math.min(viz.width.eval(feature) + viz.strokeWidth.eval(feature), SATURATION_PX);

        return diameter / 2 * this.widthScale;
    }

    _computeLineWidthScale (feature, viz) {
        const SATURATION_PX = 336;
        const diameter = Math.min(viz.width.eval(feature), SATURATION_PX);

        return diameter / 2 * this.widthScale;
    }

    _computePolygonWidthScale (feature, viz) {
        const SATURATION_PX = 336;
        const diameter = Math.min(viz.strokeWidth.eval(feature), SATURATION_PX);

        return diameter / 2 * this.widthScale;
    }
}

function _updateAABBForGeometry (feature, aabb, geometryType) {
    switch (geometryType) {
        case 'line':
            return _updateAABBLine(feature, aabb);
        case 'polygon':
            return _updateAABBPolygon(feature, aabb);
    }
}

function _updateAABBLine (line, aabb) {
    const vertices = line;
    const numVertices = line.length;

    for (let i = 0; i < numVertices; i += 2) {
        aabb.minx = Math.min(aabb.minx, vertices[i + 0]);
        aabb.miny = Math.min(aabb.miny, vertices[i + 1]);
        aabb.maxx = Math.max(aabb.maxx, vertices[i + 0]);
        aabb.maxy = Math.max(aabb.maxy, vertices[i + 1]);
    }

    return aabb;
}

function _updateAABBPolygon (polygon, aabb) {
    const [ vertices, numVertices ] = [ polygon.flat, polygon.holes[0] || polygon.flat.length / 2 ];

    for (let i = 0; i < numVertices; i++) {
        aabb.minx = Math.min(aabb.minx, vertices[2 * i + 0]);
        aabb.miny = Math.min(aabb.miny, vertices[2 * i + 1]);
        aabb.maxx = Math.max(aabb.maxx, vertices[2 * i + 0]);
        aabb.maxy = Math.max(aabb.maxy, vertices[2 * i + 1]);
    }

    return aabb;
}

function _isFeatureAABBInsideViewport (featureAABB, viewportAABB) {
    return (featureAABB.minx >= viewportAABB.minx && featureAABB.maxx <= viewportAABB.maxx &&
            featureAABB.miny >= viewportAABB.miny && featureAABB.maxy <= viewportAABB.maxy);
}

function _isFeatureAABBOutsideViewport (featureAABB, viewportAABB) {
    return (featureAABB.minx > viewportAABB.maxx || featureAABB.miny > viewportAABB.maxy ||
            featureAABB.maxx < viewportAABB.minx || featureAABB.maxy < viewportAABB.miny);
}

function _isPolygonCollidingViewport (vertices, normals, strokeWidthScale, viewportAABB) {
    for (let i = 0; i < vertices.length; i += 6) {
        const triangle = [{
            x: vertices[i + 0] + normals[i + 0] * strokeWidthScale,
            y: vertices[i + 1] + normals[i + 1] * strokeWidthScale
        }, {
            x: vertices[i + 2] + normals[i + 2] * strokeWidthScale,
            y: vertices[i + 3] + normals[i + 3] * strokeWidthScale
        }, {
            x: vertices[i + 4] + normals[i + 4] * strokeWidthScale,
            y: vertices[i + 5] + normals[i + 5] * strokeWidthScale
        }, {
            x: vertices[i + 0] + normals[i + 0] * strokeWidthScale,
            y: vertices[i + 1] + normals[i + 1] * strokeWidthScale
        }];

        if (triangleCollides(triangle, viewportAABB)) {
            return true;
        }
    }

    return false;
}
