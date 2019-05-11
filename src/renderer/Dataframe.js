import { pointInTriangle, pointInCircle, GEOMETRY_TYPE } from '../utils/geometry';
import { triangleCollides } from '../utils/collision';
import DummyDataframe from './DummyDataframe';
import { RESOLUTION_ZOOMLEVEL_ZERO } from '../constants/layer';
import { WM_R } from '../utils/util';
import { FILTERING_THRESHOLD } from './Renderer';

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
    /**
     * Loads all the relevant information to the WebGL context, provided by the renderer.
     * This includes:
     *   - the textures for each property
     *   - the buffers for vertices & normals
     *   - the auxiliary textures for style properties
     *
     * This method is very intensive in terms of computations, loading potentially a lot of CPU data to the GPU
     *
     */
    bindRenderer (renderer) {
        this.renderer = renderer;
        this.height = this._getSize().height;

        // Load alphanumeric properties to WebGL textures
        this.addProperties();

        // Load geometry-related data to WebGL buffers
        this._loadVertices();
        this._loadNormals();
        this._loadFeatureIds();

        // Create auxiliary WebGL style textures
        this._createEmptyStyleTextures();
    }

    /**
     * Gets vertices from decoded geometries
     */
    _getVertices () {
        return this.decodedGeom.vertices;
    }

    /**
     * Gets breakpoints from decoded geometries
     */
    _getBreakpoints () {
        return this.decodedGeom.breakpoints;
    }

    /**
     * Gets normals from decoded geometries
     */
    _getNormals () {
        return this.decodedGeom.normals;
    }

    /**
     * Gets width & height size, considering RTT_WIDTH and the number of features
     */
    _getSize () {
        const width = this.renderer.RTT_WIDTH;
        const height = Math.ceil(this.numFeatures / width);
        return {
            width,
            height
        };
    }

    /**
     * Gets the WebGL context from the renderer
     */
    _getGL () {
        return this.renderer.gl;
    }

    /**
     * Creates the WebGL `vertexBuffer` and loads there the vertices
     */
    _loadVertices () {
        const gl = this._getGL();
        const vertices = this._getVertices();

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    }

    /**
     * Creates the WebGL `normalBuffer` and loads there the normals, if they exist
     */
    _loadNormals () {
        const gl = this._getGL();
        const normals = this._getNormals();

        if (normals) {
            this.normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
        }
    }

    /**
     * Creates the WebGL `featureIDBuffer` and loads there the featureIds per vertex
     */
    _loadFeatureIds () {
        const gl = this._getGL();
        const ids = this._getFeatureIds();

        this.featureIDBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.featureIDBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, ids, gl.STATIC_DRAW);
    }

    /**
     * Gets the featureId per each vertice.
     */
    _getFeatureIds () {
        const breakpoints = this._getBreakpoints();
        const isPointType = !breakpoints.length;

        if (isPointType) {
            return this._getFeatureIdsForPoints();
        } else {
            return this._getFeatureIdsForLinesOrPolygons();
        }
    }

    _getFeatureIdsForPoints () {
        const numVertices = this._getVertices().length;
        let { tableX, tableY } = this._createTablesXY();

        const ids = new Float32Array(numVertices);
        const inc = 1 / (1024 * 64);
        let index = 0;

        for (let i = 0; i < numVertices; i += 6) {
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

        return ids;
    }

    _getFeatureIdsForLinesOrPolygons () {
        const numVertices = this._getVertices().length;
        let { tableX, tableY } = this._createTablesXY();
        const breakpoints = this._getBreakpoints();

        const ids = new Float32Array(numVertices);
        let index = 0;

        for (let i = 0; i < numVertices; i += 2) {
            while (i === breakpoints[index]) {
                index++;
            }
            ids[i + 0] = tableX[index];
            ids[i + 1] = tableY[index];
        }

        return ids;
    }

    _createTablesXY () {
        let tableX = {};
        let tableY = {};

        const { height, width } = this._getSize();

        for (let k = 0; k < this.numFeatures; k++) {
            // Transform integer ID into a `vec2` to overcome WebGL 1 limitations,
            // output IDs will be in the `vec2([0,1], [0,1])` range
            tableX[k] = (k % width) / (width - 1);
            tableY[k] = height > 1 ? Math.floor(k / width) / (height - 1) : 0.5;
        }

        return { tableX, tableY };
    }

    getFeaturesAtPosition (position, viz) {
        if (!this.matrix) {
            return [];
        }
        switch (this.type) {
            case GEOMETRY_TYPE.POINT:
                return this._getPointsAtPosition(position, viz);
            case GEOMETRY_TYPE.LINE:
            case GEOMETRY_TYPE.POLYGON:
                return this._getFeaturesAtPositionFromTriangles(this.type, position, viz);
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

        this._loadPropertyValuesToTexture(propertyName);
        return this.propertyTex[propertyName];
    }

    /**
      * Creates a WebGL texture for that property and loads the property values,
      * if they exist
     */
    _loadPropertyValuesToTexture (propertyName) {
        const gl = this._getGL(); // Dataframe is already bound to this context, "hot update" it
        const propertiesFloat32Array = this.properties[propertyName];

        const size = this._getSize();
        this.height = size.height; // TODO is this required here again? besides bindRenderer

        if (propertiesFloat32Array) {
            this.propertyTex[propertyName] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.propertyTex[propertyName]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA,
                size.width, size.height, 0, gl.ALPHA, gl.FLOAT,
                propertiesFloat32Array);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }
    }

    free () {
        this._freeWebGLElements();

        Object.keys(this).forEach(key => {
            this[key] = null;
        });

        this.freed = true;
    }

    _freeWebGLElements () {
        if (!this.propertyTex) {
            return;
        }

        const gl = this._getGL();

        this.propertyTex.map(tex => gl.deleteTexture(tex));

        gl.deleteTexture(this.texColor);
        gl.deleteTexture(this.texStrokeColor);
        gl.deleteTexture(this.texWidth);
        gl.deleteTexture(this.texStrokeWidth);
        gl.deleteTexture(this.texFilter);

        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.featureIDBuffer);
    }

    /**
     * Checks if the point is inside the viewport.
     */
    _isPointInViewport (featureIndex) {
        const vertices = this._getVertices();
        const x = vertices[6 * featureIndex + 0];
        const y = vertices[6 * featureIndex + 1];

        const { ox, oy, ow } = this._toClipSpace(x, y);

        // Checks in Clip Space if the point is inside the viewport
        // See https://www.khronos.org/opengl/wiki/Vertex_Post-Processing#Clipping
        const inside = ox > -ow && ox < ow && oy > -ow && oy < ow;
        return inside;
    }

    _isPolygonInViewport (featureIndex) {
        const featureAABB = this._aabb[featureIndex];
        const aabbResult = this._compareAABBs(featureAABB);

        if (aabbResult === AABBTestResults.INTERSECTS) {
            const vertices = this._getVertices();
            const normals = this._getNormals();
            const range = this.decodedGeom.featureIDToVertexIndex.get(featureIndex);
            return this._isPolygonCollidingViewport(vertices, normals, range.start, range.end);
        }

        return aabbResult === AABBTestResults.INSIDE;
    }

    /**
     * Converts a point {x, y} in WebMercator to {lng, lat}
     */
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
        const { ox, oy, ow } = this._toClipSpace(x, y);

        // Normalize by W
        return { x: ox / ow, y: oy / ow };
    }

    _toClipSpace (x, y) {
        const matrix = this.matrix;
        const ox = matrix[0] * x + matrix[4] * y + matrix[12];
        const oy = matrix[1] * x + matrix[5] * y + matrix[13];
        const ow = matrix[3] * x + matrix[7] * y + matrix[15];

        return { ox, oy, ow };
    }

    _getPointsAtPosition (position, viz) {
        const points = this._getVertices();

        // FIXME: points.length includes rejected points (out of tile)
        // so we use numFeatures here, but should fix the points size
        const features = [];
        for (let i = 0; i < this.numFeatures * 6; i += 6) {
            const featureIndex = i / 6;
            const feature = this.getFeature(featureIndex);

            if (this._isFeatureFiltered(feature, viz.filter)) {
                continue;
            }

            const point = { x: points[i], y: points[i + 1] };
            const { center, radius } = this._getCircleFor(point, feature, viz);

            const inside = pointInCircle(position, center, radius);
            if (inside) {
                features.push(feature);
            }
        }

        return features;
    }

    /**
     * Gets a circle for that point of the feature, considering the viz properties
     * (symbolPlacement, transform, width and strokeWidth).
     *
     * It is expressed as {center, radius}, using pixel coordinates
     */
    _getCircleFor (point, feature, viz) {
        const { WIDTH, HEIGHT } = this._getCanvasSizeInPixels();

        const center = this._projectToNDC(point.x, point.y);

        // Project to pixel space
        center.x *= 0.5;
        center.y *= -0.5;
        center.x += 0.5;
        center.y += 0.5;
        center.x *= WIDTH;
        center.y *= HEIGHT;

        const radius = this._computePointRadius(feature, viz);

        if (!viz.symbol.default) {
            const symbolOffset = viz.symbolPlacement.eval(feature);
            center.x += symbolOffset[0] * radius;
            center.y -= symbolOffset[1] * radius;
        }

        if (!viz.transform.default) {
            const vizOffset = viz.transform.eval(feature);
            center.x += vizOffset.x;
            center.y -= vizOffset.y;
        }

        return { center, radius };
    }

    _computePointRadius (feature, viz) {
        const widthPixels = Math.min(viz.width.eval(feature), SIZE_SATURATION_PX);
        const strokeWidthPixels = Math.min(viz.strokeWidth.eval(feature), SIZE_SATURATION_PX);
        const diameter = widthPixels + strokeWidthPixels;
        return diameter / 2;
    }

    _computeLineWidthScale (feature, viz) {
        const diameter = Math.min(viz.width.eval(feature), SIZE_SATURATION_PX);
        return diameter / 2 / this.scale / this._resolutionForZoomLevel();
    }

    _computePolygonWidthScale (feature, viz) {
        const diameter = Math.min(viz.strokeWidth.eval(feature), SIZE_SATURATION_PX);
        return diameter / 2 / this.scale / this._resolutionForZoomLevel();
    }

    _resolutionForZoomLevel () {
        return (Math.pow(2, this.renderer.drawMetadata.zoomLevel) * RESOLUTION_ZOOMLEVEL_ZERO);
    }

    /**
     * Get canvas size in pixels, in a {WIDTH, HEIGHT} object, using the devicePixelRatio
     */
    _getCanvasSizeInPixels () {
        const canvas = this._getGL().canvas;
        const WIDTH = canvas.width / window.devicePixelRatio;
        const HEIGHT = canvas.height / window.devicePixelRatio;

        return { WIDTH, HEIGHT };
    }

    _getFeaturesAtPositionFromTriangles (geometryType, position, viz) {
        const vertices = this._getVertices();
        const normals = this._getNormals();
        const breakpoints = this._getBreakpoints();

        const features = [];
        // Linear search for all features
        // Tests triangles since we already have the triangulated form
        // Moreover, with an acceleration structure and triangle testing features could be subdivided easily
        let featureIndex = -1;
        let strokeWidthScale;
        const offset = { x: 0, y: 0 };

        const { WIDTH, HEIGHT } = this._getCanvasSizeInPixels();

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
                    !this._isPointInAABB(position, offset,
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

            const inside = pointInTriangle(position,
                { x: v1.x * WIDTH + offset.x, y: v1.y * HEIGHT - offset.y },
                { x: v2.x * WIDTH + offset.x, y: v2.y * HEIGHT - offset.y },
                { x: v3.x * WIDTH + offset.x, y: v3.y * HEIGHT - offset.y });

            if (inside) {
                features.push(this.getFeature(featureIndex));
                // Don't repeat a feature if the point is on a shared (by two triangles) edge
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

        const { WIDTH, HEIGHT } = this._getCanvasSizeInPixels();

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
        return filterExpression.eval(feature) < FILTERING_THRESHOLD;
    }

    /**
     * Defines a `ViewportFeature` class dynamically, with the proper getters
     * to access its properties, if that doesn't exist yet in the `featureClassCache`
     */
    _genFeatureClass () {
        if (featureClassCache.has(this.metadata)) {
            this._cls = featureClassCache.get(this.metadata);
            return;
        }

        // TODO: Extract class template creation to an external builder helper
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
     * Builds a feature object for an index, copying all the properties.
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

    /**
     * Adds new properties to the dataframe or overwrite previously stored ones,
     * using metadata properties.
     *
     * These are all the relevant alphanumeric properties, which have been previously encoded
     * in a form like {propertyName: Float32Array}
     *
     */
    addProperties () {
        for (let i = 0; i < this.metadata.propertyKeys.length; i++) {
            const propertyName = this.metadata.propertyKeys[i];
            this._addProperty(propertyName);
        }

        this._genFeatureClass();
    }

    /**
     * If below GPU auto upload texture limit, it ensures that a WebGL texture is ready with
     * the values for that property already loaded
     */
    _addProperty (propertyName) {
        if (Object.keys(this.propertyTex).length < MAX_GPU_AUTO_UPLOAD_TEXTURE_LIMIT) {
            this.getPropertyTexture(propertyName);
        }
    }

    _createEmptyStyleTextures () {
        this.texColor = this._createStyleDataframeTexture();
        this.texWidth = this._createStyleDataframeTexture();
        this.texStrokeColor = this._createStyleDataframeTexture();
        this.texStrokeWidth = this._createStyleDataframeTexture();
        this.texFilter = this._createStyleDataframeTexture();
    }

    /**
     * Creates a new empty WebGL texture.
     * It just reserves the space for this 'intermediate texture'
     */
    _createStyleDataframeTexture () {
        // TODO we are wasting 75% of the memory for the scalar attributes (width, strokeWidth),
        // since RGB components are discarded
        const gl = this._getGL();
        const size = this._getSize();

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
            size.width, size.height, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            null); // empty!
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
