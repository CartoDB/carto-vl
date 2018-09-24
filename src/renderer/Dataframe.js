import { wToR } from '../client/rsys';
import { pointInTriangle, pointInCircle, pointInRectangle } from '../../src/utils/geometry';
import { triangleCollides } from '../utils/collision';
import DummyDataframe from './DummyDataframe';
import { vec4 } from 'gl-matrix';

// Maximum number of property textures that will be uploaded automatically to the GPU
// in a non-lazy manner
const MAX_GPU_AUTO_UPLOAD_TEXTURE_LIMIT = 32;

const featureClassCache = new Map();
const AABBTestResults = {
    INSIDE: 1,
    OUTSIDE: -1,
    INTERSECTS: 0
};

export default class Dataframe extends DummyDataframe {
    setFreeObserver (freeObserver) {
        this.freeObserver = freeObserver;
    }

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

        this.texColor = this._createStyleDataframeTexture(this.numFeatures);
        this.texWidth = this._createStyleDataframeTexture(this.numFeatures);
        this.texStrokeColor = this._createStyleDataframeTexture(this.numFeatures);
        this.texStrokeWidth = this._createStyleDataframeTexture(this.numFeatures);
        this.texFilter = this._createStyleDataframeTexture(this.numFeatures);

        const ids = new Float32Array(vertices.length);
        const inc = 1 / (1024 * 64);
        let index = 0;
        let tableX = {};
        let tableY = {};

        for (let k = 0; k < this.numFeatures; k++) {
            // Transform integer ID into a `vec2` to overcome WebGL 1 limitations,
            // output IDs will be in the `vec2([0,1], [0,1])` range
            tableX[k] = (k % width) / (width - 1);
            tableY[k] = height > 1 ? Math.floor(k / width) / (height - 1) : 0.5;
        }

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

    getViewportAABB (renderScale, center, aspect) {
        return this._getBounds(renderScale, center, aspect);
    }

    inViewport (featureIndex, viz, viewportAABB) {
        const feature = this.getFeature(featureIndex);
        let strokeWidthScale = 1;

        if (!viz.transform.default) {
            const vizOffset = viz.transform.eval(feature);
            const widthScale = this.widthScale / 2;
            viewportAABB = {
                minx: viewportAABB.minx,
                miny: viewportAABB.miny,
                maxx: viewportAABB.maxx,
                maxy: viewportAABB.maxy
            };

            viewportAABB.minx -= vizOffset[0] * widthScale;
            viewportAABB.maxx -= vizOffset[0] * widthScale;
            viewportAABB.miny -= vizOffset[1] * widthScale;
            viewportAABB.maxy -= vizOffset[1] * widthScale;
        }

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

    _isPointInViewport (featureIndex) {
        if (!this.matrix) {
            return false;
        }
        const x = this.decodedGeom.vertices[6 * featureIndex + 0];
        const y = this.decodedGeom.vertices[6 * featureIndex + 1];
        // Transform to Clip Space
        const p = vec4.transformMat4([], [x, y, 0, 1], this.matrix);
        // Check in Clip Space if the point is inside the viewport
        // See https://www.khronos.org/opengl/wiki/Vertex_Post-Processing#Clipping
        return p[0] > -p[3] && p[0] < p[3] && p[1] > -p[3] && p[1] < p[3];
    }

    _isPolygonInViewport (featureIndex, viewportAABB, strokeWidthScale) {
        const featureAABB = this._aabb[featureIndex];
        const aabbResult = this._compareAABBs(featureAABB, viewportAABB, strokeWidthScale);
        const vertices = this.decodedGeom.vertices;
        const normals = this.decodedGeom.normals;

        if (aabbResult === AABBTestResults.INTERSECTS) {
            const range = this.decodedGeom.featureIDToVertexIndex.get(featureIndex);
            return _isPolygonCollidingViewport(vertices, normals, range.start, range.end, strokeWidthScale, viewportAABB);
        }

        return aabbResult === AABBTestResults.INSIDE;
    }

    _compareAABBs (featureAABB, viewportAABB, stroke) {
        if (featureAABB === null) {
            return AABBTestResults.OUTSIDE;
        }

        // FIXME, also keep aspect ratio in mind when fixing
        stroke = 0;

        const featureStrokeAABB = {
            minx: this._projectToNDC(featureAABB.minx) - stroke,
            miny: this._projectToNDC(featureAABB.miny) - stroke,
            maxx: this._projectToNDC(featureAABB.maxx) + stroke,
            maxy: this._projectToNDC(featureAABB.maxy) + stroke
        };

        // NDC viewport (by definition)
        viewportAABB = {
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

    _projectToNDC (p) {
        return vec4.transformMat4([], p, this.matrix).map((x, _, v) => x / v[3]);
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
        const points = this.decodedGeom.vertices;
        const features = [];

        const widthScale = this.widthScale / 2;

        const WIDTH = this.renderer.gl.canvas.width;
        const HEIGHT = this.renderer.gl.canvas.height;

        for (let i = 0; i < points.length; i += 6) {
            const featureIndex = i / 6;

            const feature = this.getFeature(featureIndex);

            if (this._isFeatureFiltered(feature, viz.filter)) {
                continue;
            }

            const center = {
                x: points[i],
                y: points[i + 1]
            };

            const c = [center.x, center.y, 0, 1];
            const c2 = vec4.transformMat4([], c, this.matrix).map((x, _, v) => x / v[3]);
            c2[0] *= 0.5;
            c2[1] *= -0.5;
            c2[0] += 0.5;
            c2[1] += 0.5;

            const strokeWidthScale = this._computePointWidthScale(feature, viz);

            if (!viz.symbol.default) {
                const symbolOffset = viz.symbolPlacement.eval(feature);
                center.x += symbolOffset[0] * strokeWidthScale;
                center.y += symbolOffset[1] * strokeWidthScale;
            }
            if (!viz.transform.default) {
                const vizOffset = viz.transform.eval(feature);
                center.x += vizOffset[0] * widthScale;
                center.y += vizOffset[1] * widthScale;
            }

            const inside = pointInCircle(pos, { x: c2[0] * WIDTH, y: c2[1] * HEIGHT }, strokeWidthScale);

            if (inside) {
                features.push(this.getFeature(featureIndex));
            }
        }

        return features;
    }

    _computePointWidthScale (feature, viz) {
        const SATURATION_PX = 1024;
        const diameter = Math.min(viz.width.eval(feature), SATURATION_PX) + Math.min(viz.strokeWidth.eval(feature), SATURATION_PX);

        return diameter / 2;
    }

    get widthScale () {
        return this.renderer
            ? (2 / this.renderer.gl.canvas.clientHeight) / this.scale * this.renderer._zoom
            : 1;
    }

    _computeLineWidthScale (feature, viz) {
        const SATURATION_PX = 1024;
        const diameter = Math.min(viz.width.eval(feature), SATURATION_PX);

        return diameter / 2 / this.scale / (Math.pow(2, this.renderer.drawMetadata.zoomLevel) * 512);
    }

    _computePolygonWidthScale (feature, viz) {
        const SATURATION_PX = 1024;
        const diameter = Math.min(viz.strokeWidth.eval(feature), SATURATION_PX);

        return diameter / 2 / this.scale / (Math.pow(2, this.renderer.drawMetadata.zoomLevel) * 512);
    }

    _getFeaturesFromTriangles (geometryType, pos, viz) {
        const vertices = this.decodedGeom.vertices;
        const normals = this.decodedGeom.normals;
        const breakpoints = this.decodedGeom.breakpoints;
        const features = [];
        // Linear search for all features
        // Tests triangles since we already have the triangulated form
        // Moreover, with an acceleration structure and triangle testing features could be subdivided easily
        let featureIndex = -1;
        let strokeWidthScale;
        const widthScale = this.widthScale / 2;
        let pointWithOffset;

        const WIDTH = this.renderer.gl.canvas.width;
        const HEIGHT = this.renderer.gl.canvas.height;

        for (let i = 0; i < vertices.length; i += 6) {
            if (i === 0 || i >= breakpoints[featureIndex]) {
                featureIndex++;
                const feature = this.getFeature(featureIndex);
                let offset = { x: 0, y: 0 };

                if (!viz.transform.default) {
                    const vizOffset = viz.transform.eval(feature);
                    offset.x = vizOffset[0] * widthScale;
                    offset.y = vizOffset[1] * widthScale;
                }

                pointWithOffset = { x: pos.x - offset.x, y: pos.y - offset.y };

                if (this._isFeatureFiltered(feature, viz.filter)
                    || this._isPointInAABB(pointWithOffset, featureIndex)) {
                    i = breakpoints[featureIndex] - 6;
                    continue;
                }

                strokeWidthScale = geometryType === 'line'
                    ? this._computeLineWidthScale(feature, viz)
                    : this._computePolygonWidthScale(feature, viz);
            }

            const v1 = vec4.transformMat4([], [
                vertices[i + 0] + normals[i + 0] * strokeWidthScale,
                vertices[i + 1] + normals[i + 1] * strokeWidthScale, 0, 1
            ], this.matrix).map((x, _, v) => x / v[3]);

            const v2 = vec4.transformMat4([], [
                vertices[i + 2] + normals[i + 2] * strokeWidthScale,
                vertices[i + 3] + normals[i + 3] * strokeWidthScale, 0, 1
            ], this.matrix).map((x, _, v) => x / v[3]);

            const v3 = vec4.transformMat4([], [
                vertices[i + 4] + normals[i + 4] * strokeWidthScale,
                vertices[i + 5] + normals[i + 5] * strokeWidthScale, 0, 1
            ], this.matrix).map((x, _, v) => x / v[3]);

            v1[0] *= 0.5;
            v1[1] *= -0.5;
            v1[0] += 0.5;
            v1[1] += 0.5;

            v2[0] *= 0.5;
            v2[1] *= -0.5;
            v2[0] += 0.5;
            v2[1] += 0.5;

            v3[0] *= 0.5;
            v3[1] *= -0.5;
            v3[0] += 0.5;
            v3[1] += 0.5;

            const inside = pointInTriangle(pointWithOffset,
                { x: v1[0] * WIDTH, y: v1[1] * HEIGHT },
                { x: v2[0] * WIDTH, y: v2[1] * HEIGHT },
                { x: v3[0] * WIDTH, y: v3[1] * HEIGHT });

            if (inside) {
                features.push(this.getFeature(featureIndex));
                // Don't repeat a feature if we the point is on a shared (by two triangles) edge
                // Also, don't waste CPU cycles
                i = breakpoints[featureIndex] - 6;
            }
        }

        return features;
    }

    _isPointInAABB (point, featureIndex) {
        // Transform AABB from tile space to NDC space
        const aabb = this._aabb[featureIndex];
        const corners = [
            this._projectToNDC([aabb.minx, aabb.miny, 0, 1]),
            this._projectToNDC([aabb.minx, aabb.maxy, 0, 1]),
            this._projectToNDC([aabb.maxx, aabb.miny, 0, 1]),
            this._projectToNDC([aabb.maxx, aabb.maxy, 0, 1])
        ];

        // An AABB in world/tile space may no longer be an AABB in NDC space
        // Therefore, we'll need to check against the  quadrilateral
        // We perform that by cheking against two triangles by dividing the quadilateral with one of its diagonals
        // If and only if the point is in any of the triangles, the point is on the quadrilateral (i.e. on the original AABB)
        return pointInTriangle(point, corners[0], corners[1], corners[2]) || pointInTriangle(point, corners[1], corners[2], corners[3]);
    }

    _projectToPixelSpace (p) {
        const ndc = this._projectToNDC(p);

        const WIDTH = this.renderer.gl.canvas.width;
        const HEIGHT = this.renderer.gl.canvas.height;

        return [
            WIDTH * (ndc[0] * 0.5 + 0.5),
            HEIGHT * (-ndc[1] * 0.5 + 0.5)
        ];
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

        const metadata = this.metadata;
        const getters = {};
        for (let i = 0; i < this.metadata.propertyKeys.length; i++) {
            const propertyName = this.metadata.propertyKeys[i];
            getters[propertyName] = {
                get: function () {
                    const index = this._index;
                    if (metadata.properties[propertyName].type === 'category') {
                        return metadata.IDToCategory.get(this._dataframe.properties[propertyName][index]);
                    } else {
                        return this._dataframe.properties[propertyName][index];
                    }
                }
            };
        }

        Object.defineProperties(cls.prototype, getters);

        featureClassCache.set(this.metadata, cls);
        this._cls = cls;
    }

    _getFeatureProperty (index, propertyName) {
        if (this.metadata.properties[propertyName].type === 'category') {
            return this.metadata.IDToCategory.get(this.properties[propertyName][index]);
        } else {
            return this.properties[propertyName][index];
        }
    }

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
            null);
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

function _isPolygonCollidingViewport (vertices, normals, start, end, strokeWidthScale, viewportAABB) {
    for (let i = start; i < end; i += 6) {
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
