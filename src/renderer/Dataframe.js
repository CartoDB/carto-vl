import { pointInTriangle, pointInCircle } from '../../src/utils/geometry';
import { triangleCollides } from '../utils/collision';
import DummyDataframe from './DummyDataframe';
import { RESOLUTION_ZOOMLEVEL_ZERO } from '../constants/layer';
import { WM_R } from '../utils/util';
import { GEOMETRY_TYPE } from '../utils/geometry';

// Maximum number of property textures that will be uploaded automatically to the GPU
// in a non-lazy manner
const MAX_GPU_AUTO_UPLOAD_TEXTURE_LIMIT = 32;

const SIZE_SATURATION_PX = 1024;

const featureClassCache = new Map();
const AABBTestResults = {
    INSIDE: 1,
    OUTSIDE: -1,
    INTERSECTS: 0
};

export default class Dataframe extends DummyDataframe {
    bindRenderer (renderer) {
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
        this._createStyleDataframeTextures(this.numFeatures);

        const ids = new Float32Array(vertices.length);
        const inc = 1 / (1024 * 64);
        let index = 0;

        let [tableX, tableY] = this._createTablesXY(this.numFeatures, width, height);

        if (!breakpoints.length) {
            for (let i = 0; i < vertices.length; i += 6) {
                ids[i + 0] = tableX[index];
                ids[i + 1] = tableY[index];

                if (ids[i + 0] === 0) {
                    ids[i + 0] += inc;
                }
                if (ids[i + 1] === 0) {
                    ids[i + 1] += inc;
                }

                ids[i + 2] = -ids[i + 0];
                ids[i + 3] = ids[i + 1];

                ids[i + 4] = ids[i + 0];
                ids[i + 5] = -ids[i + 1];
                index++;
            }
        } else {
            for (let i = 0; i < vertices.length; i += 2) {
                while (i === breakpoints[index]) {
                    index++;
                }
                ids[i + 0] = tableX[index];
                ids[i + 1] = tableY[index];
            }
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
        if (!this.matrix) {
            return [];
        }
        switch (this.type) {
            case GEOMETRY_TYPE.POINT:
                return this._getPointsAtPosition(pos, viz);
            case GEOMETRY_TYPE.LINE:
            case GEOMETRY_TYPE.POLYGON:
                return this._getFeaturesAtPositionFromTriangles(this.type, pos, viz);
            default:
                return [];
        }
    }

    inViewport (featureIndex) {
        if (!this.matrix) {
            return false;
        }
        switch (this.type) {
            case GEOMETRY_TYPE.POINT:
                return this._isPointInViewport(featureIndex);
            case GEOMETRY_TYPE.LINE:
            case GEOMETRY_TYPE.POLYGON:
                return this._isPolygonInViewport(featureIndex);
            default:
                return false;
        }
    }

    getRenderedCentroid (featureIndex) {
        const centroid = { ...this._centroids[featureIndex] };
        centroid.x = centroid.x * this.scale + this.center.x;
        centroid.y = centroid.y * this.scale + this.center.y;
        const g = this._unprojectFromWebMercator(centroid);
        return [g.lng, g.lat];
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

        Object.keys(this).map(key => {
            this[key] = null;
        });

        this.freed = true;
    }

    _createTablesXY (numFeatures, width, height) {
        let tableX = {};
        let tableY = {};

        for (let k = 0; k < numFeatures; k++) {
            // Transform integer ID into a `vec2` to overcome WebGL 1 limitations,
            // output IDs will be in the `vec2([0,1], [0,1])` range
            tableX[k] = (k % width) / (width - 1);
            tableY[k] = height > 1 ? Math.floor(k / width) / (height - 1) : 0.5;
        }
        return [tableX, tableY];
    }

    _isPointInViewport (featureIndex) {
        const matrix = this.matrix;
        const x = this.decodedGeom.vertices[6 * featureIndex + 0];
        const y = this.decodedGeom.vertices[6 * featureIndex + 1];

        const ox = matrix[0] * x + matrix[4] * y + matrix[12];
        const oy = matrix[1] * x + matrix[5] * y + matrix[13];
        const ow = matrix[3] * x + matrix[7] * y + matrix[15];

        // Transform to Clip Space
        // Check in Clip Space if the point is inside the viewport
        // See https://www.khronos.org/opengl/wiki/Vertex_Post-Processing#Clipping
        return ox > -ow && ox < ow && oy > -ow && oy < ow;
    }

    _isPolygonInViewport (featureIndex) {
        const featureAABB = this._aabb[featureIndex];
        const aabbResult = this._compareAABBs(featureAABB);

        if (aabbResult === AABBTestResults.INTERSECTS) {
            const vertices = this.decodedGeom.vertices;
            const normals = this.decodedGeom.normals;
            const range = this.decodedGeom.featureIDToVertexIndex.get(featureIndex);
            return this._isPolygonCollidingViewport(vertices, normals, range.start, range.end);
        }

        return aabbResult === AABBTestResults.INSIDE;
    }

    _unprojectFromWebMercator ({ x, y }) {
        const DEG2RAD = Math.PI / 180;
        const EARTH_RADIUS = 6378137;
        return {
            lng: x * WM_R / EARTH_RADIUS / DEG2RAD,
            lat: (Math.atan(Math.pow(Math.E, y * WM_R / EARTH_RADIUS)) - Math.PI / 4) * 2 / DEG2RAD
        };
    }

    _compareAABBs (featureAABB) {
        if (featureAABB === null) {
            return AABBTestResults.OUTSIDE;
        }

        const corners1 = this._projectToNDC(featureAABB.minx, featureAABB.miny);
        const corners2 = this._projectToNDC(featureAABB.minx, featureAABB.maxy);
        const corners3 = this._projectToNDC(featureAABB.maxx, featureAABB.miny);
        const corners4 = this._projectToNDC(featureAABB.maxx, featureAABB.maxy);

        const featureStrokeAABB = {
            minx: Math.min(corners1.x, corners2.x, corners3.x, corners4.x),
            miny: Math.min(corners1.y, corners2.y, corners3.y, corners4.y),
            maxx: Math.max(corners1.x, corners2.x, corners3.x, corners4.x),
            maxy: Math.max(corners1.y, corners2.y, corners3.y, corners4.y)
        };

        const viewportAABB = {
            minx: -1,
            miny: -1,
            maxx: 1,
            maxy: 1
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

    _isPolygonCollidingViewport (vertices, normals, start, end) { // NORMALS??? FIXME TODO
        if (!this.matrix) {
            return false;
        }
        const aabb = { minx: -1, miny: -1, maxx: 1, maxy: 1 };
        for (let i = start; i < end; i += 6) {
            const v1 = this._projectToNDC(vertices[i + 0], vertices[i + 1]);
            const v2 = this._projectToNDC(vertices[i + 2], vertices[i + 3]);
            const v3 = this._projectToNDC(vertices[i + 4], vertices[i + 5]);

            const triangle = [{
                x: v1.x,
                y: v1.y
            }, {
                x: v2.x,
                y: v2.y
            }, {
                x: v3.x,
                y: v3.y
            }];

            if (triangleCollides(triangle, aabb)) {
                return true;
            }
        }

        return false;
    }

    _projectToNDC (x, y) {
        const matrix = this.matrix;
        const ox = matrix[0] * x + matrix[4] * y + matrix[12];
        const oy = matrix[1] * x + matrix[5] * y + matrix[13];
        const ow = matrix[3] * x + matrix[7] * y + matrix[15];

        // Normalize by W
        return { x: ox / ow, y: oy / ow };
    }

    _getPointsAtPosition (pos, viz) {
        const points = this.decodedGeom.vertices;
        const features = [];

        const WIDTH = this.renderer.gl.canvas.width / window.devicePixelRatio;
        const HEIGHT = this.renderer.gl.canvas.height / window.devicePixelRatio;

        // FIXME: points.length includes rejected points (out of tile)
        // so we use numFeatures here, but should fix the points size
        for (let i = 0; i < this.numFeatures * 6; i += 6) {
            const featureIndex = i / 6;

            const feature = this.getFeature(featureIndex);

            if (this._isFeatureFiltered(feature, viz.filter)) {
                continue;
            }

            const center = {
                x: points[i],
                y: points[i + 1]
            };
            const c2 = this._projectToNDC(center.x, center.y);

            // Project to pixel space
            c2.x *= 0.5;
            c2.y *= -0.5;
            c2.x += 0.5;
            c2.y += 0.5;
            c2.x *= WIDTH;
            c2.y *= HEIGHT;

            const radius = this._computePointRadius(feature, viz);

            if (!viz.symbol.default) {
                const symbolOffset = viz.symbolPlacement.eval(feature);
                c2.x += symbolOffset[0] * radius;
                c2.y -= symbolOffset[1] * radius;
            }
            if (!viz.transform.default) {
                const vizOffset = viz.transform.eval(feature);
                c2.x += vizOffset.x;
                c2.y -= vizOffset.y;
            }

            const inside = pointInCircle(pos, c2, radius);

            if (inside) {
                features.push(this.getFeature(featureIndex));
            }
        }

        return features;
    }

    _computePointRadius (feature, viz) {
        const diameter = Math.min(viz.width.eval(feature), SIZE_SATURATION_PX) + Math.min(viz.strokeWidth.eval(feature), SIZE_SATURATION_PX);

        return diameter / 2;
    }

    _computeLineWidthScale (feature, viz) {
        const diameter = Math.min(viz.width.eval(feature), SIZE_SATURATION_PX);

        return diameter / 2 / this.scale / (Math.pow(2, this.renderer.drawMetadata.zoomLevel) * RESOLUTION_ZOOMLEVEL_ZERO);
    }

    _computePolygonWidthScale (feature, viz) {
        const diameter = Math.min(viz.strokeWidth.eval(feature), SIZE_SATURATION_PX);

        return diameter / 2 / this.scale / (Math.pow(2, this.renderer.drawMetadata.zoomLevel) * RESOLUTION_ZOOMLEVEL_ZERO);
    }

    _getFeaturesAtPositionFromTriangles (geometryType, pos, viz) {
        const vertices = this.decodedGeom.vertices;
        const normals = this.decodedGeom.normals;
        const breakpoints = this.decodedGeom.breakpoints;
        const features = [];
        // Linear search for all features
        // Tests triangles since we already have the triangulated form
        // Moreover, with an acceleration structure and triangle testing features could be subdivided easily
        let featureIndex = -1;
        let strokeWidthScale;
        const offset = { x: 0, y: 0 };

        const WIDTH = this.renderer.gl.canvas.width / window.devicePixelRatio;
        const HEIGHT = this.renderer.gl.canvas.height / window.devicePixelRatio;

        for (let i = 0; i < vertices.length; i += 6) {
            if (i === 0 || i >= breakpoints[featureIndex]) {
                featureIndex++;
                const feature = this.getFeature(featureIndex);

                if (!viz.transform.default) {
                    const vizOffset = viz.transform.eval(feature);
                    offset.x = vizOffset[0];
                    offset.y = vizOffset[1];
                }

                strokeWidthScale = geometryType === GEOMETRY_TYPE.LINE
                    ? this._computeLineWidthScale(feature, viz)
                    : this._computePolygonWidthScale(feature, viz);

                if (this._isFeatureFiltered(feature, viz.filter) ||
                    !this._isPointInAABB(pos, offset,
                        geometryType === GEOMETRY_TYPE.LINE
                            ? viz.width.eval(feature)
                            : viz.strokeWidth.eval(feature)
                        ,
                        featureIndex)
                ) {
                    i = breakpoints[featureIndex] - 6;
                    continue;
                }
            }

            const v1 = this._projectToNDC(
                vertices[i + 0] + normals[i + 0] * strokeWidthScale,
                vertices[i + 1] + normals[i + 1] * strokeWidthScale
            );

            const v2 = this._projectToNDC(
                vertices[i + 2] + normals[i + 2] * strokeWidthScale,
                vertices[i + 3] + normals[i + 3] * strokeWidthScale
            );

            const v3 = this._projectToNDC(
                vertices[i + 4] + normals[i + 4] * strokeWidthScale,
                vertices[i + 5] + normals[i + 5] * strokeWidthScale
            );

            v1.x *= 0.5;
            v1.y *= -0.5;
            v1.x += 0.5;
            v1.y += 0.5;

            v2.x *= 0.5;
            v2.y *= -0.5;
            v2.x += 0.5;
            v2.y += 0.5;

            v3.x *= 0.5;
            v3.y *= -0.5;
            v3.x += 0.5;
            v3.y += 0.5;

            const inside = pointInTriangle(pos,
                { x: v1.x * WIDTH + offset.x, y: v1.y * HEIGHT - offset.y },
                { x: v2.x * WIDTH + offset.x, y: v2.y * HEIGHT - offset.y },
                { x: v3.x * WIDTH + offset.x, y: v3.y * HEIGHT - offset.y });

            if (inside) {
                features.push(this.getFeature(featureIndex));
                // Don't repeat a feature if we the point is on a shared (by two triangles) edge
                // Also, don't waste CPU cycles
                i = breakpoints[featureIndex] - 6;
            }
        }

        return features;
    }

    _isPointInAABB (point, offset, widthScale, featureIndex) {
        // Transform AABB from tile space to NDC space
        const aabb = this._aabb[featureIndex];
        if (aabb === null || !this.matrix) {
            return false;
        }

        const corners1 = this._projectToNDC(aabb.minx, aabb.miny);
        const corners2 = this._projectToNDC(aabb.minx, aabb.maxy);
        const corners3 = this._projectToNDC(aabb.maxx, aabb.miny);
        const corners4 = this._projectToNDC(aabb.maxx, aabb.maxy);

        const ndcAABB = {
            minx: Math.min(corners1.x, corners2.x, corners3.x, corners4.x),
            miny: Math.min(corners1.y, corners2.y, corners3.y, corners4.y),
            maxx: Math.max(corners1.x, corners2.x, corners3.x, corners4.x),
            maxy: Math.max(corners1.y, corners2.y, corners3.y, corners4.y)
        };

        const WIDTH = this.renderer.gl.canvas.width / window.devicePixelRatio;
        const HEIGHT = this.renderer.gl.canvas.height / window.devicePixelRatio;

        const ox = 2 * offset.x / WIDTH;
        const oy = 2 * offset.y / HEIGHT;
        const ndcPoint = {
            x: point.x / WIDTH * 2 - 1,
            y: -(point.y / HEIGHT * 2 - 1)
        };
        const pointAABB = {
            minx: ndcPoint.x + ox - widthScale * 2 / WIDTH,
            miny: ndcPoint.y - oy - widthScale * 2 / HEIGHT,
            maxx: ndcPoint.x + ox + widthScale * 2 / WIDTH,
            maxy: ndcPoint.y - oy + widthScale * 2 / HEIGHT
        };

        return !_isFeatureAABBOutsideViewport(ndcAABB, pointAABB);
    }

    _isFeatureFiltered (feature, filterExpression) {
        return filterExpression.eval(feature) < 0.5;
    }

    _genFeatureClass () {
        if (featureClassCache.has(this.metadata)) {
            this._cls = featureClassCache.get(this.metadata);
            return;
        }
        const cls = class ViewportFeature {
            constructor (index, dataframe) {
                this._index = index;
                this._dataframe = dataframe;
            }
        };

        Object.defineProperties(cls.prototype, this._buildGetters());

        featureClassCache.set(this.metadata, cls);
        this._cls = cls;
    }

    _buildGetters () {
        const getters = {};
        const metadata = this.metadata;
        metadata.propertyKeys.forEach(propertyName => {
            const codec = metadata.codec(propertyName);
            if (codec.isRange()) {
                const decodedProperties = metadata.decodedProperties(propertyName);
                getters[propertyName] = {
                    get: function () {
                        const index = this._index;
                        const args = decodedProperties.map(name => this._dataframe.properties[name][index]);
                        return codec.internalToExternal(metadata, args);
                    }
                };
            } else {
                getters[propertyName] = {
                    get: function () {
                        const index = this._index;
                        const value = this._dataframe.properties[propertyName][index];
                        return codec.internalToExternal(metadata, value);
                    }
                };
            }
        });
        return getters;
    }

    /**
     * Build a feature object for an index, copying all the properties.
     */
    getFeature (index) {
        if (!this.cachedFeatures) {
            this.cachedFeatures = new Array(this.numFeatures);
        }

        if (this.cachedFeatures[index] !== undefined) {
            return this.cachedFeatures[index];
        }

        if (!this._cls) {
            this._genFeatureClass();
        }

        const feature = new this._cls(index, this);
        this.cachedFeatures[index] = feature;
        return feature;
    }

    _addProperty (propertyName) {
        if (Object.keys(this.propertyTex).length < MAX_GPU_AUTO_UPLOAD_TEXTURE_LIMIT) {
            this.getPropertyTexture(propertyName);
        }
    }

    // Add new properties to the dataframe or overwrite previously stored ones.
    // `properties` is of the form: {propertyName: Float32Array}
    addProperties (properties) {
        for (let i = 0; i < this.metadata.propertyKeys.length; i++) {
            const propertyName = this.metadata.propertyKeys[i];
            this._addProperty(propertyName);
        }
        this._genFeatureClass();
    }

    _createStyleDataframeTextures (numFeatures) {
        this.texColor = this._createStyleDataframeTexture(numFeatures);
        this.texWidth = this._createStyleDataframeTexture(numFeatures);
        this.texStrokeColor = this._createStyleDataframeTexture(numFeatures);
        this.texStrokeWidth = this._createStyleDataframeTexture(numFeatures);
        this.texFilter = this._createStyleDataframeTexture(numFeatures);
    }

    _createStyleDataframeTexture (numFeatures) {
        // TODO we are wasting 75% of the memory for the scalar attributes (width, strokeWidth),
        // since RGB components are discarded
        const gl = this.renderer.gl;
        const width = this.renderer.RTT_WIDTH;
        const height = Math.ceil(numFeatures / width);
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
            width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            null); // it just reserves the space for this intermediate texture
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        return texture;
    }
}

function _isFeatureAABBInsideViewport (featureAABB, viewportAABB) {
    return (featureAABB.minx >= viewportAABB.minx && featureAABB.maxx <= viewportAABB.maxx &&
        featureAABB.miny >= viewportAABB.miny && featureAABB.maxy <= viewportAABB.maxy);
}

function _isFeatureAABBOutsideViewport (featureAABB, viewportAABB) {
    return (featureAABB.minx > viewportAABB.maxx || featureAABB.miny > viewportAABB.maxy ||
        featureAABB.maxx < viewportAABB.minx || featureAABB.maxy < viewportAABB.miny);
}
