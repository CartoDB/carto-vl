import shaders from './shaders';
import { Asc, Desc } from './viz/expressions';

const INITIAL_TIMESTAMP = Date.now();

/**
 * The renderer use fuzzy logic where < 0.5 means false and >= 0.5 means true
 */
const FILTERING_THRESHOLD = 0.5;

/**
 * @typedef {object} RPoint - Point in renderer coordinates space
 * @property {number} x
 * @property {number} y
 */

/**
 * @description The Render To Texture Width limits the maximum number of features per tile: *maxFeatureCount = RTT_WIDTH^2*
 *
 * Large RTT_WIDTH values are unsupported by hardware. Limits vary on each machine.
 * Support starts to drop from 2048, with a drastic reduction in support for more than 4096 pixels.
 *
 * Large values imply a small overhead too.
 */
export const RTT_WIDTH = 1024;

/**
 * @description Renderer constructor. Use it to create a new renderer bound to the provided canvas.
 * Initialization will be done synchronously.
 * The function will fail in case that a WebGL context cannot be created this can happen because of the following reasons:
 *   * The provided canvas element is invalid
 *   * The browser or the machine doesn't support WebGL or the required WebGL extension and minimum parameter values
 * @jsapi
 * @memberOf renderer
 * @constructor
 * @param {HTMLElement} canvas - the WebGL context will be created on this element
 */

export default class Renderer {
    constructor (canvas) {
        if (canvas) {
            this.gl = canvas.getContext('webgl');
            if (!this.gl) {
                throw new Error('WebGL 1 is unsupported');
            }
            this._initGL(this.gl);
        }
        this._center = { x: 0, y: 0 };
        this._zoom = 1;
        this.RTT_WIDTH = RTT_WIDTH;
        this.dataframes = [];
    }

    _initGL (gl) {
        this.gl = gl;
        const OESTextureFloat = gl.getExtension('OES_texture_float');
        if (!OESTextureFloat) {
            throw new Error('WebGL extension OES_texture_float is unsupported');
        }
        const supportedRTT = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
        if (supportedRTT < RTT_WIDTH) {
            throw new Error(`WebGL parameter 'gl.MAX_RENDERBUFFER_SIZE' is below the requirement: ${supportedRTT} < ${RTT_WIDTH}`);
        }
        this._initShaders();

        this.auxFB = gl.createFramebuffer();

        // Create a VBO that covers the entire screen
        // Use a "big" triangle instead of a square for performance and simplicity
        this.bigTriangleVBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bigTriangleVBO);
        const vertices = [
            10.0, -10.0,
            0.0, 10.0,
            -10.0, -10.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // Create a 1x1 RGBA texture set to [0,0,0,0]
        // Needed because sometimes we don't really use some textures within the shader, but they are declared anyway.
        this.zeroTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.zeroTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
            1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array(4));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        this._AATex = gl.createTexture();
        this._AAFB = gl.createFramebuffer();

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, this.zeroTex);
    }

    /**
    * Get Renderer visualization center
    * @return {RPoint}
    */
    getCenter () {
        return { x: this._center.x, y: this._center.y };
    }

    /**
     * Set Renderer visualization center
     * @param {number} x
     * @param {number} y
     */
    setCenter (x, y) {
        this._center.x = x;
        this._center.y = y;
    }

    /**
     * Get Renderer visualization bounds
     * @return {*}
     */
    getBounds () {
        const center = this.getCenter();
        const sx = this.getZoom() * this.getAspect();
        const sy = this.getZoom();
        return [center.x - sx, center.y - sy, center.x + sx, center.y + sy];
    }

    /**
     * Get Renderer visualization zoom
     * @return {number}
     */
    getZoom () {
        return this._zoom;
    }

    /**
     * Set Renderer visualization zoom
     * @param {number} zoom
     */
    setZoom (zoom) {
        this._zoom = zoom;
    }

    getAspect () {
        if (this.gl) {
            return this.gl.canvas.width / this.gl.canvas.height;
        }
        return 1;
    }

    /**
     * Run aggregation functions over the visible features.
     */
    _runViewportAggregations (renderLayer) {
        const dataframes = renderLayer.getActiveDataframes();
        const viz = renderLayer.viz;

        // Performance optimization to avoid doing DFS at each feature iteration
        const viewportExpressions = this._getViewportExpressions(viz._getRootExpressions());

        if (!viewportExpressions.length) {
            return;
        }

        // Assume that all dataframes of a renderLayer share the same metadata
        const metadata = dataframes.length ? dataframes[0].metadata : {};

        viewportExpressions.forEach(expr => expr._resetViewportAgg(metadata));

        const viewportExpressionsLength = viewportExpressions.length;

        // Avoid acumulating the same feature multiple times keeping a set of processed features (same feature can belong to multiple dataframes).
        const processedFeaturesIDs = new Set();

        const aspect = this.gl.canvas.width / this.gl.canvas.height;
        dataframes.forEach(dataframe => {
            for (let i = 0; i < dataframe.numFeatures; i++) {
                const featureId = dataframe.properties[metadata.idProperty][i];

                // If feature has been acumulated ignore it
                if (processedFeaturesIDs.has(featureId)) {
                    continue;
                }
                // Ignore features outside viewport
                if (!this._isFeatureInViewport(dataframe, i, aspect)) {
                    continue;
                }
                processedFeaturesIDs.add(featureId);

                const feature = this._featureFromDataFrame(dataframe, i, metadata);

                // Ignore filtered features
                if (viz.filter.eval(feature) < FILTERING_THRESHOLD) {
                    continue;
                }

                for (let j = 0; j < viewportExpressionsLength; j++) {
                    viewportExpressions[j].accumViewportAgg(feature);
                }
            }
        });
    }

    /**
     * Check if the feature at the "index" position of the given dataframe is in the renderer viewport.
     * NOTE: requires `this.aspect` to be set
     */
    _isFeatureInViewport (dataframe, index, aspect) {
        const scale = 1 / this._zoom;
        return dataframe.inViewport(index, scale, this._center, aspect);
    }

    /**
     * Perform a depth first search through the expression tree collecting all viewport expressions.
     */
    _getViewportExpressions (rootExpressions) {
        const viewportExpressions = [];

        function dfs (expr) {
            if (expr._isViewport) {
                viewportExpressions.push(expr);
            } else {
                expr._getChildren().map(dfs);
            }
        }

        rootExpressions.map(dfs);
        return viewportExpressions;
    }

    /**
     * Build a feature object from a dataframe and an index copying all the properties.
     */
    _featureFromDataFrame (dataframe, index, metadata) {
        if (!dataframe.cachedFeatures) {
            dataframe.cachedFeatures = [];
        }

        if (dataframe.cachedFeatures[index] !== undefined) {
            return dataframe.cachedFeatures[index];
        }

        const feature = {};
        const propertyNames = Object.keys(dataframe.properties);
        for (let i = 0; i < propertyNames.length; i++) {
            const name = propertyNames[i];
            if (metadata.properties[name].type === 'category') {
                feature[name] = metadata.IDToCategory.get(dataframe.properties[name][index]);
            } else {
                feature[name] = dataframe.properties[name][index];
            }
        }
        dataframe.cachedFeatures[index] = feature;
        return feature;
    }

    renderLayer (renderLayer) {
        const tiles = renderLayer.getActiveDataframes();
        const viz = renderLayer.viz;
        const gl = this.gl;
        const aspect = this.getAspect();
        const drawMetadata = {
            zoom: gl.drawingBufferHeight / (this._zoom * 1024 * (window.devicePixelRatio || 1)) // Used by zoom expression
        };

        if (!tiles.length) {
            return;
        }
        viz._getRootExpressions().map(expr => expr._dataReady());

        gl.enable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.STENCIL_TEST);
        gl.depthMask(false);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.auxFB);

        this._runViewportAggregations(renderLayer);

        const styleDataframe = (tile, tileTexture, shader, vizExpr) => {
            const textureId = shader.textureIds.get(viz);

            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tileTexture, 0);
            gl.viewport(0, 0, RTT_WIDTH, tile.height);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(shader.program);
            // Enforce that property texture TextureUnit don't clash with auxiliar ones
            drawMetadata.freeTexUnit = Object.keys(textureId).length;
            vizExpr._setTimestamp((Date.now() - INITIAL_TIMESTAMP) / 1000.0);
            vizExpr._preDraw(shader.program, drawMetadata, gl);

            Object.keys(textureId).forEach((name, i) => {
                gl.activeTexture(gl.TEXTURE0 + i);
                gl.bindTexture(gl.TEXTURE_2D, tile.getPropertyTexture(name));
                gl.uniform1i(textureId[name], i);
            });

            gl.enableVertexAttribArray(shader.vertexAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bigTriangleVBO);
            gl.vertexAttribPointer(shader.vertexAttribute, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLES, 0, 3);
            gl.disableVertexAttribArray(shader.vertexAttribute);
        };

        tiles.map(tile => styleDataframe(tile, tile.texColor, viz.colorShader, viz.color));
        tiles.map(tile => styleDataframe(tile, tile.texWidth, viz.widthShader, viz.width));
        tiles.map(tile => styleDataframe(tile, tile.texStrokeColor, viz.strokeColorShader, viz.strokeColor));
        tiles.map(tile => styleDataframe(tile, tile.texStrokeWidth, viz.strokeWidthShader, viz.strokeWidth));
        tiles.map(tile => styleDataframe(tile, tile.texFilter, viz.filterShader, viz.filter));

        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        if (renderLayer.type !== 'point') {
            const antialiasingScale = (window.devicePixelRatio || 1) >= 2 ? 1 : 2;
            gl.bindFramebuffer(gl.FRAMEBUFFER, this._AAFB);
            const [w, h] = [gl.drawingBufferWidth, gl.drawingBufferHeight];

            if (w !== this._width || h !== this._height) {
                gl.bindTexture(gl.TEXTURE_2D, this._AATex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                    w * antialiasingScale, h * antialiasingScale, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._AATex, 0);

                const renderbuffer = gl.createRenderbuffer();
                gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
                gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w * antialiasingScale, h * antialiasingScale);
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

                [this._width, this._height] = [w, h];
            }
            gl.viewport(0, 0, w * antialiasingScale, h * antialiasingScale);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }

        const scale = 1.0 / this._zoom;

        const { orderingMins, orderingMaxs } = getOrderingRenderBuckets(renderLayer);

        const renderDrawPass = orderingIndex => tiles.forEach(tile => {
            let freeTexUnit = 0;
            let renderer = null;
            if (!viz.symbol._default) {
                renderer = viz.symbolShader;
            } else if (tile.type === 'point') {
                renderer = this.finalRendererProgram;
            } else if (tile.type === 'line') {
                renderer = this.lineRendererProgram;
            } else {
                renderer = this.triRendererProgram;
            }
            gl.useProgram(renderer.program);

            if (!viz.symbol._default) {
                gl.uniform1i(renderer.overrideColor, viz.color.default === undefined ? 1 : 0);
            }

            // Set filtering condition on "... AND feature is in current order bucket"
            gl.uniform1f(renderer.orderMinWidth, orderingMins[orderingIndex]);
            gl.uniform1f(renderer.orderMaxWidth, orderingMaxs[orderingIndex]);

            gl.uniform2f(renderer.vertexScaleUniformLocation,
                (scale / aspect) * tile.scale,
                scale * tile.scale);
            gl.uniform2f(renderer.vertexOffsetUniformLocation,
                (scale / aspect) * (this._center.x - tile.center.x),
                scale * (this._center.y - tile.center.y));
            if (tile.type === 'line' || tile.type === 'polygon') {
                gl.uniform2f(renderer.normalScale, 1 / gl.canvas.clientWidth, 1 / gl.canvas.clientHeight);
            } else if (tile.type === 'point') {
                gl.uniform1f(renderer.devicePixelRatio, window.devicePixelRatio || 1);
            }

            tile.vertexScale = [(scale / aspect) * tile.scale, scale * tile.scale];

            tile.vertexOffset = [(scale / aspect) * (this._center.x - tile.center.x), scale * (this._center.y - tile.center.y)];

            gl.enableVertexAttribArray(renderer.vertexPositionAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, tile.vertexBuffer);
            gl.vertexAttribPointer(renderer.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);

            gl.enableVertexAttribArray(renderer.featureIdAttr);
            gl.bindBuffer(gl.ARRAY_BUFFER, tile.featureIDBuffer);
            gl.vertexAttribPointer(renderer.featureIdAttr, 2, gl.FLOAT, false, 0, 0);

            if (tile.type === 'line' || tile.type === 'polygon') {
                gl.enableVertexAttribArray(renderer.normalAttr);
                gl.bindBuffer(gl.ARRAY_BUFFER, tile.normalBuffer);
                gl.vertexAttribPointer(renderer.normalAttr, 2, gl.FLOAT, false, 0, 0);
            }

            gl.activeTexture(gl.TEXTURE0 + freeTexUnit);
            gl.bindTexture(gl.TEXTURE_2D, tile.texColor);
            gl.uniform1i(renderer.colorTexture, freeTexUnit);
            freeTexUnit++;

            gl.activeTexture(gl.TEXTURE0 + freeTexUnit);
            gl.bindTexture(gl.TEXTURE_2D, tile.texWidth);
            gl.uniform1i(renderer.widthTexture, freeTexUnit);
            freeTexUnit++;

            gl.activeTexture(gl.TEXTURE0 + freeTexUnit);
            gl.bindTexture(gl.TEXTURE_2D, tile.texFilter);
            gl.uniform1i(renderer.filterTexture, freeTexUnit);
            freeTexUnit++;

            if (!viz.symbol._default) {
                const textureId = viz.symbolShader.textureIds.get(viz);
                // Enforce that property texture and style texture TextureUnits don't clash with auxiliar ones
                drawMetadata.freeTexUnit = freeTexUnit + Object.keys(textureId).length;
                viz.symbol._setTimestamp((Date.now() - INITIAL_TIMESTAMP) / 1000.0);
                viz.symbol._preDraw(viz.symbolShader.program, drawMetadata, gl);

                viz.symbolPlacement._setTimestamp((Date.now() - INITIAL_TIMESTAMP) / 1000.0);
                viz.symbolPlacement._preDraw(viz.symbolShader.program, drawMetadata, gl);

                freeTexUnit = drawMetadata.freeTexUnit;

                Object.keys(textureId).forEach(name => {
                    gl.activeTexture(gl.TEXTURE0 + freeTexUnit);
                    gl.bindTexture(gl.TEXTURE_2D, tile.getPropertyTexture(name));
                    gl.uniform1i(textureId[name], freeTexUnit);
                    freeTexUnit++;
                });

                gl.uniform2f(renderer.resolution, gl.canvas.width, gl.canvas.height);
            } else if (tile.type !== 'line') {
                // Lines don't support stroke
                gl.activeTexture(gl.TEXTURE0 + freeTexUnit);
                gl.bindTexture(gl.TEXTURE_2D, tile.texStrokeColor);
                gl.uniform1i(renderer.colorStrokeTexture, freeTexUnit);
                freeTexUnit++;

                gl.activeTexture(gl.TEXTURE0 + freeTexUnit);
                gl.bindTexture(gl.TEXTURE_2D, tile.texStrokeWidth);
                gl.uniform1i(renderer.strokeWidthTexture, freeTexUnit);
                freeTexUnit++;
            }

            if (tile.type === 'line' || tile.type === 'polygon') {
                gl.clearDepth(1);
                gl.depthFunc(gl.NOTEQUAL);
                gl.depthMask(true);
                gl.clear(gl.DEPTH_BUFFER_BIT);
                gl.enable(gl.DEPTH_TEST);
            }

            gl.drawArrays(tile.type === 'point' ? gl.POINTS : gl.TRIANGLES, 0, tile.numVertex);

            gl.disableVertexAttribArray(renderer.vertexPositionAttribute);
            gl.disableVertexAttribArray(renderer.featureIdAttr);
            if (tile.type === 'line' || tile.type === 'polygon') {
                gl.disableVertexAttribArray(renderer.normalAttr);
            }
        });
        orderingMins.map((_, orderingIndex) => {
            renderDrawPass(orderingIndex);
        });

        if (renderLayer.type !== 'point') {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

            gl.useProgram(this._aaBlendShader.program);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this._AATex);
            gl.uniform1i(this._aaBlendShader.readTU, 0);

            gl.enableVertexAttribArray(this._aaBlendShader.vertexAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bigTriangleVBO);
            gl.vertexAttribPointer(this._aaBlendShader.vertexAttribute, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLES, 0, 3);
            gl.disableVertexAttribArray(this._aaBlendShader.vertexAttribute);
        }

        gl.disable(gl.CULL_FACE);
    }

    /**
     * Initialize static shaders
     */
    _initShaders () {
        this.finalRendererProgram = shaders.renderer.createPointShader(this.gl);
        this.triRendererProgram = shaders.renderer.createTriShader(this.gl);
        this.lineRendererProgram = shaders.renderer.createLineShader(this.gl);
        this._aaBlendShader = new shaders.AABlender(this.gl);
    }
}

function getOrderingRenderBuckets (renderLayer) {
    const orderer = renderLayer.viz.order;
    let orderingMins = [0];
    let orderingMaxs = [1000];
    // We divide the ordering into 64 buckets of 2 pixels each, since the size limit is 127 pixels
    const NUM_BUCKETS = 64;
    if (orderer.isA(Asc)) {
        orderingMins = Array.from({ length: NUM_BUCKETS }, (_, i) => ((NUM_BUCKETS - 1) - i) * 2);
        orderingMaxs = Array.from({ length: NUM_BUCKETS }, (_, i) => i === 0 ? 1000 : ((NUM_BUCKETS - 1) - i + 1) * 2);
    } else if (orderer.isA(Desc)) {
        orderingMins = Array.from({ length: NUM_BUCKETS }, (_, i) => i * 2);
        orderingMaxs = Array.from({ length: NUM_BUCKETS }, (_, i) => i === (NUM_BUCKETS - 1) ? 1000 : (i + 1) * 2);
    }
    return {
        orderingMins,
        orderingMaxs
    };
}
