import { GEOMETRY_TYPE } from '../../utils/geometry';
import DummyDataframe from './DummyDataframe';
import { WM_R } from '../../utils/util';

import { genViewportFeatureClass } from './viewportFeature';

import FeatureIdsHelper from './FeatureIdsHelper';
import ViewportHelper from './ViewportHelper';

// Maximum number of property textures that will be uploaded automatically to the GPU
// in a non-lazy manner
const MAX_GPU_AUTO_UPLOAD_TEXTURE_LIMIT = 32;

const featureClassCache = new Map();

export default class Dataframe extends DummyDataframe {
    constructor (...args) {
        super(...args);

        this._initHelpers();
    }

    _initHelpers () {
        if (!this._featureIdsHelper) {
            this._featureIdsHelper = new FeatureIdsHelper(this);
        }

        if (!this._viewportHelper) {
            this._viewportHelper = new ViewportHelper(this);
        }
    }

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

        this._initHelpers();

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
     * Gets width & height size, considering RTT_WIDTH and the number of features
     */
    getSize () {
        const width = this.renderer.RTT_WIDTH;
        const height = Math.ceil(this.numFeatures / width);
        return { width, height };
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
        const vertices = this.decodedGeom.vertices;

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    }

    /**
     * Creates the WebGL `normalBuffer` and loads there the normals, if they exist
     */
    _loadNormals () {
        const gl = this._getGL();
        const normals = this.decodedGeom.normals;

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
        const ids = this._featureIdsHelper.getFeatureIds();

        this.featureIDBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.featureIDBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, ids, gl.STATIC_DRAW);
    }

    getFeaturesAtPosition (position, viz) {
        if (!this.matrix) {
            return [];
        }

        switch (this.type) {
            case GEOMETRY_TYPE.POINT:
                return this._viewportHelper.getPointsAtPosition(position, viz);
            case GEOMETRY_TYPE.LINE:
            case GEOMETRY_TYPE.POLYGON:
                return this._viewportHelper.getFeaturesAtPositionFromTriangles(this.type, position, viz);
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
                return this._viewportHelper.isPointInViewport(featureIndex);
            case GEOMETRY_TYPE.LINE:
            case GEOMETRY_TYPE.POLYGON:
                return this._viewportHelper.isPolygonInViewport(featureIndex);
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

        const { width, height } = this.getSize();

        if (propertiesFloat32Array) {
            this.propertyTex[propertyName] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.propertyTex[propertyName]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA,
                width, height, 0, gl.ALPHA, gl.FLOAT,
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

    /**
     * Defines a `ViewportFeature` class dynamically, with the proper getters
     * to access its properties, if that doesn't exist yet in the `featureClassCache`
     */
    _genFeatureClass () {
        if (featureClassCache.has(this.metadata)) {
            this._featureClass = featureClassCache.get(this.metadata);
            return;
        }

        const cls = genViewportFeatureClass(this.metadata);

        featureClassCache.set(this.metadata, cls);
        this._featureClass = cls;
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

        if (!this._featureClass) {
            this._genFeatureClass();
        }

        const feature = new this._featureClass(index, this);
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
        const { width, height } = this.getSize();

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
            width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            null); // empty!
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        return texture;
    }
}
