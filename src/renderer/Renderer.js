import shaders from './shaders';
import { Asc, Desc } from './viz/expressions';
import CartoRuntimeError, { CartoRuntimeTypes as crt } from '../errors/carto-runtime-error';
import { mat4 } from 'gl-matrix';
import { RESOLUTION_ZOOMLEVEL_ZERO } from '../constants/layer';

const INITIAL_TIMESTAMP = Date.now();

/**
 * The renderer use fuzzy logic where < 0.5 means false and >= 0.5 means true
 */
const FILTERING_THRESHOLD = 0.5;

/**
 * @typedef {Object} RPoint - Point in renderer coordinates space
 * @property {number} x
 * @property {number} y
 */

/**
 * @description The Render To Texture Width limits the maximum number of features per dataframe: *maxFeatureCount = RTT_WIDTH^2*
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
                throw new CartoRuntimeError(`${crt.WEB_GL} WebGL 1 is unsupported`);
            }
            this._initGL(this.gl);
        }
        this._center = { x: 0, y: 0 };
        this._zoom = 1;
        this.RTT_WIDTH = RTT_WIDTH;
        this.dataframes = [];
    }

    /**
     * Initialize renderer
     * @param {WebGLRenderingContext} gl - WebGL context
     */
    initialize (gl) {
        this._initGL(gl);
    }

    /**
     * Set Renderer visualization center
     * @param {number} x
     * @param {number} y
     */
    setCenter (center) {
        this._center.x = center.x;
        this._center.y = center.y;
    }

    /**
     * Set Renderer visualization zoom
     * @param {number} zoom
     */
    setZoom (zoom) {
        this._zoom = zoom;
    }

    /**
     * Get Renderer visualization bounds
     * @return {*}
     */
    getBounds () {
        const sx = this._zoom * this._getAspect();
        const sy = this._zoom;
        return [this._center.x - sx, this._center.y - sy, this._center.x + sx, this._center.y + sy];
    }

    _initGL (gl) {
        this.gl = gl;
        const OESTextureFloat = gl.getExtension('OES_texture_float');
        if (!OESTextureFloat) {
            throw new CartoRuntimeError(`${crt.WEB_GL} WebGL extension 'OES_texture_float' is unsupported`);
        }
        const supportedRTT = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
        if (supportedRTT < RTT_WIDTH) {
            throw new CartoRuntimeError(`${crt.WEB_GL} WebGL parameter 'gl.MAX_RENDERBUFFER_SIZE' is below the requirement: ${supportedRTT} < ${RTT_WIDTH}`);
        }
        this._initShaders();

        this.auxFB = gl.createFramebuffer();

        // Create a VBO that covers the entire screen
        // Use a "big" triangle instead of a square for performance and simplicity
        this.bigTriangleVBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bigTriangleVBO);
        const vertices = new Float32Array([
            10.0, -10.0,
            0.0, 10.0,
            -10.0, -10.0
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

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

    _getAspect () {
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
        const metadata = dataframes.length ? dataframes[0].metadata : null;

        viewportExpressions.forEach(expr => expr._resetViewportAgg(metadata));

        const viewportExpressionsLength = viewportExpressions.length;

        // Avoid acumulating the same feature multiple times keeping a set of processed features (same feature can belong to multiple dataframes).
        const processedFeaturesIDs = new Set();

        dataframes.forEach(dataframe => {
            for (let i = 0; i < dataframe.numFeatures; i++) {
                const featureId = dataframe.properties[metadata.idProperty][i];

                // If feature has been acumulated ignore it
                if (processedFeaturesIDs.has(featureId)) {
                    continue;
                }
                // Ignore features outside viewport
                if (!dataframe.inViewport(i, viz)) {
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
        return dataframe.getFeature(index);
    }

    renderLayer (renderLayer, drawMetadata) {
        this.drawMetadata = drawMetadata;
        const dataframes = renderLayer.getActiveDataframes();
        const viz = renderLayer.viz;
        const gl = this.gl;

        this._updateDataframeMatrices(dataframes);

        this._runViewportAggregations(renderLayer);

        if (!dataframes.length) {
            return;
        }
        viz._getRootExpressions().map(expr => expr._dataReady());

        gl.enable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.STENCIL_TEST);
        gl.depthMask(false);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.auxFB);

        const styleDataframe = (dataframe, dataframeTexture, shader, vizExpr) => {
            const textureId = shader.textureIds.get(viz);

            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, dataframeTexture, 0);
            gl.viewport(0, 0, RTT_WIDTH, dataframe.height);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(shader.program);
            // Enforce that property texture TextureUnit don't clash with auxiliar ones
            drawMetadata.freeTexUnit = Object.keys(textureId).length;
            vizExpr._setTimestamp((Date.now() - INITIAL_TIMESTAMP) / 1000.0);
            vizExpr._preDraw(shader.program, drawMetadata, gl);

            Object.keys(textureId).forEach((name, i) => {
                gl.activeTexture(gl.TEXTURE0 + i);
                gl.bindTexture(gl.TEXTURE_2D, dataframe.getPropertyTexture(name));
                gl.uniform1i(textureId[name], i);
            });

            gl.enableVertexAttribArray(shader.vertexAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bigTriangleVBO);
            gl.vertexAttribPointer(shader.vertexAttribute, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLES, 0, 3);
            gl.disableVertexAttribArray(shader.vertexAttribute);
        };

        dataframes.map(dataframe => styleDataframe(dataframe, dataframe.texColor, viz.colorShader, viz.color));
        dataframes.map(dataframe => styleDataframe(dataframe, dataframe.texWidth, viz.widthShader, viz.width));
        dataframes.map(dataframe => styleDataframe(dataframe, dataframe.texStrokeColor, viz.strokeColorShader, viz.strokeColor));
        dataframes.map(dataframe => styleDataframe(dataframe, dataframe.texStrokeWidth, viz.strokeWidthShader, viz.strokeWidth));
        dataframes.map(dataframe => styleDataframe(dataframe, dataframe.texFilter, viz.filterShader, viz.filter));

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

        const { orderingMins, orderingMaxs } = getOrderingRenderBuckets(renderLayer);

        if (dataframes[0].type === 'line' || dataframes[0].type === 'polygon') {
            gl.clearDepth(1);
            gl.depthRange(0, 1);
            gl.depthFunc(gl.NOTEQUAL);
            gl.depthMask(true);
            gl.enable(gl.DEPTH_TEST);
        }

        const renderDrawPass = orderingIndex => dataframes.forEach(dataframe => {
            let freeTexUnit = 0;
            let renderer = null;
            if (!viz.symbol.default) {
                renderer = viz.symbolShader;
            } else if (dataframe.type === 'point') {
                renderer = viz.pointShader;
            } else if (dataframe.type === 'line') {
                renderer = viz.lineShader;
            } else {
                renderer = viz.polygonShader;
            }
            gl.useProgram(renderer.program);

            // Set filtering condition on "... AND feature is in current order bucket"
            gl.uniform1f(renderer.orderMinWidth, orderingMins[orderingIndex]);
            gl.uniform1f(renderer.orderMaxWidth, orderingMaxs[orderingIndex]);

            gl.uniform1f(renderer.normalScale, 1 / (Math.pow(2, drawMetadata.zoomLevel) * RESOLUTION_ZOOMLEVEL_ZERO * dataframe.scale));

            gl.enableVertexAttribArray(renderer.vertexPositionAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, dataframe.vertexBuffer);
            gl.vertexAttribPointer(renderer.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);

            gl.enableVertexAttribArray(renderer.featureIdAttr);
            gl.bindBuffer(gl.ARRAY_BUFFER, dataframe.featureIDBuffer);
            gl.vertexAttribPointer(renderer.featureIdAttr, 2, gl.FLOAT, false, 0, 0);

            if (dataframe.type === 'line' || dataframe.type === 'polygon') {
                gl.enableVertexAttribArray(renderer.normalAttr);
                gl.bindBuffer(gl.ARRAY_BUFFER, dataframe.normalBuffer);
                gl.vertexAttribPointer(renderer.normalAttr, 2, gl.FLOAT, false, 0, 0);
            }

            gl.activeTexture(gl.TEXTURE0 + freeTexUnit);
            gl.bindTexture(gl.TEXTURE_2D, dataframe.texColor);
            gl.uniform1i(renderer.colorTexture, freeTexUnit);
            freeTexUnit++;

            gl.activeTexture(gl.TEXTURE0 + freeTexUnit);
            gl.bindTexture(gl.TEXTURE_2D, dataframe.texWidth);
            gl.uniform1i(renderer.widthTexture, freeTexUnit);
            freeTexUnit++;

            gl.activeTexture(gl.TEXTURE0 + freeTexUnit);
            gl.bindTexture(gl.TEXTURE_2D, dataframe.texFilter);
            gl.uniform1i(renderer.filterTexture, freeTexUnit);
            freeTexUnit++;
            gl.uniform2f(renderer.resolution, gl.canvas.width, gl.canvas.height);

            if (!viz.symbol.default) {
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
                    gl.bindTexture(gl.TEXTURE_2D, dataframe.getPropertyTexture(name));
                    gl.uniform1i(textureId[name], freeTexUnit);
                    freeTexUnit++;
                });
            } else if (dataframe.type !== 'line') {
                // Lines don't support stroke
                gl.activeTexture(gl.TEXTURE0 + freeTexUnit);
                gl.bindTexture(gl.TEXTURE_2D, dataframe.texStrokeColor);
                gl.uniform1i(renderer.strokeColorTexture, freeTexUnit);
                freeTexUnit++;

                gl.activeTexture(gl.TEXTURE0 + freeTexUnit);
                gl.bindTexture(gl.TEXTURE_2D, dataframe.texStrokeWidth);
                gl.uniform1i(renderer.strokeWidthTexture, freeTexUnit);
                freeTexUnit++;
            }

            if (dataframe.type === 'line' || dataframe.type === 'polygon') {
                gl.clear(gl.DEPTH_BUFFER_BIT);
            }

            if (!viz.transform.default) {
                const textureId = renderer.textureIds.get(viz);
                // Enforce that property texture and style texture TextureUnits don't clash with auxiliar ones
                drawMetadata.freeTexUnit = freeTexUnit + Object.keys(textureId).length;
                viz.transform._setTimestamp((Date.now() - INITIAL_TIMESTAMP) / 1000.0);
                viz.transform._preDraw(renderer.program, drawMetadata, gl);

                freeTexUnit = drawMetadata.freeTexUnit;

                Object.keys(textureId).forEach(name => {
                    gl.activeTexture(gl.TEXTURE0 + freeTexUnit);
                    gl.bindTexture(gl.TEXTURE_2D, dataframe.getPropertyTexture(name));
                    gl.uniform1i(textureId[name], freeTexUnit);
                    freeTexUnit++;
                });

                gl.uniform2f(renderer.resolution, gl.canvas.width, gl.canvas.height);
            }

            gl.uniformMatrix4fv(renderer.matrix, false, dataframe.matrix);

            gl.drawArrays(gl.TRIANGLES, 0, dataframe.numVertex);

            gl.disableVertexAttribArray(renderer.vertexPositionAttribute);
            gl.disableVertexAttribArray(renderer.featureIdAttr);
            if (dataframe.type === 'line' || dataframe.type === 'polygon') {
                gl.disableVertexAttribArray(renderer.normalAttr);
                gl.disable(gl.DEPTH_TEST);
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

    _updateDataframeMatrices (dataframes) {
        dataframes.forEach(dataframe => {
            let m2 = [];
            let m3 = [];
            mat4.copy(m2, this.matrix);
            mat4.identity(m3);
            mat4.translate(m3, m3, [0.5, 0.5, 0]);
            mat4.scale(m3, m3, [0.5, -0.5, 1]);

            mat4.translate(m3, m3, [dataframe.center.x, dataframe.center.y, 0]);
            mat4.scale(m3, m3, [dataframe.scale, dataframe.scale, 1]);

            mat4.multiply(m2, m2, m3);
            dataframe.matrix = m2;
        });
    }

    /**
     * Initialize static shaders
     */
    _initShaders () {
        this._aaBlendShader = new shaders.AABlender(this.gl);
    }
}

function getOrderingRenderBuckets (renderLayer) {
    const orderer = renderLayer.viz.order;
    const MAX_SIZE = 1030;
    let orderingMins = [0];
    let orderingMaxs = [MAX_SIZE];
    // We divide the ordering into 64 buckets of 2 pixels each, since the size limit is 127 pixels
    const NUM_BUCKETS = 64;
    if (orderer.isA(Asc)) {
        orderingMins = Array.from({ length: NUM_BUCKETS }, (_, i) => ((NUM_BUCKETS - 1) - i) * 2);
        orderingMaxs = Array.from({ length: NUM_BUCKETS }, (_, i) => i === 0 ? MAX_SIZE : ((NUM_BUCKETS - 1) - i + 1) * 2);
    } else if (orderer.isA(Desc)) {
        orderingMins = Array.from({ length: NUM_BUCKETS }, (_, i) => i * 2);
        orderingMaxs = Array.from({ length: NUM_BUCKETS }, (_, i) => i === (NUM_BUCKETS - 1) ? MAX_SIZE : (i + 1) * 2);
    }
    return {
        orderingMins,
        orderingMaxs
    };
}
