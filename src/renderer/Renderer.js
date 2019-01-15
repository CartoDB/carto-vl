import shaders from './shaders';
import { Asc, Desc } from './viz/expressions';
import CartoRuntimeError, { CartoRuntimeTypes as crt } from '../errors/carto-runtime-error';
import { mat4 } from 'gl-matrix';
import { RESOLUTION_ZOOMLEVEL_ZERO } from '../constants/layer';
import { parseVizExpression } from './viz/parser';
import { runViewportAggregations } from './viz/expressions/aggregation/viewport/ViewportAggCalculator';
import { GEOMETRY_TYPE } from '../utils/geometry';

const INITIAL_TIMESTAMP = Date.now();
let timestamp = INITIAL_TIMESTAMP;
requestAnimationFrame(refreshClock);
function refreshClock () {
    timestamp = (Date.now() - INITIAL_TIMESTAMP) / 1000.0;
    requestAnimationFrame(refreshClock);
}

/**
 * The renderer use fuzzy logic where < 0.5 means false and >= 0.5 means true
 */
export const FILTERING_THRESHOLD = 0.5;

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
            this.gl = getValidWebGLContextOrThrow(canvas);
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
        gl = getValidWebGLContextOrThrow(null, gl);
        this._initGL(gl);
    }

    _initGL (gl) {
        this.gl = gl;
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

        this._AATex = gl.createTexture(); // Antialiasing
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

    renderLayer (renderLayer, drawMetadata) {
        this.drawMetadata = drawMetadata;
        const dataframes = renderLayer.getActiveDataframes();
        const viz = renderLayer.viz;
        if (!viz) {
            return;
        }
        const gl = this.gl;

        this._updateDataframeMatrices(dataframes);

        renderLayer.parseVizExpression = parseVizExpression; // Important! to avoid a circular dependency problem (eg. viewportFeatures)
        runViewportAggregations(renderLayer);

        if (!dataframes.length) {
            return;
        }
        viz._getRootExpressions().map(expr => expr._dataReady());

        gl.enable(gl.CULL_FACE); // this enables an optimization but it forces a particular vertices orientation
        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.STENCIL_TEST);
        gl.depthMask(false);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.auxFB);

        // To execute once per daframe and style property
        // (geometries, properties and ids have been already loaded to GPU)
        const styleDataframe = (dataframe, dataframeTexture, metashader, vizExpr) => {
            const shader = metashader.shader;
            const textureId = metashader.textureIds;

            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, dataframeTexture, 0);
            gl.viewport(0, 0, RTT_WIDTH, dataframe.height);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(shader.program);
            // Enforce that property texture TextureUnit don't clash with auxiliar ones
            drawMetadata.freeTexUnit = Object.keys(textureId).length;
            vizExpr._setTimestamp(timestamp);
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

        // Draw dataframe style textures
        dataframes.map(dataframe => styleDataframe(dataframe, dataframe.texColor, viz.colorMetaShader, viz.color));
        if (dataframes[0].type !== GEOMETRY_TYPE.POLYGON) {
            dataframes.map(dataframe => styleDataframe(dataframe, dataframe.texWidth, viz.widthMetaShader, viz.width));
        }
        if (dataframes[0].type !== GEOMETRY_TYPE.LINE) {
            dataframes.map(dataframe => styleDataframe(dataframe, dataframe.texStrokeColor, viz.strokeColorMetaShader, viz.strokeColor));
            dataframes.map(dataframe => styleDataframe(dataframe, dataframe.texStrokeWidth, viz.strokeWidthMetaShader, viz.strokeWidth));
        }
        dataframes.map(dataframe => styleDataframe(dataframe, dataframe.texFilter, viz.filterMetaShader, viz.filter));

        // Final drawing (to screen). In the case of lines / polygons, there is an extra step (for antialiasing)
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);

        if (renderLayer.type === GEOMETRY_TYPE.POINT) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        } else {
            // lines & polygon (antialiasing)
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

        if (dataframes[0].type === GEOMETRY_TYPE.LINE || dataframes[0].type === GEOMETRY_TYPE.POLYGON) {
            gl.clearDepth(1);
            gl.depthRange(0, 1);
            gl.depthFunc(gl.NOTEQUAL);
            gl.depthMask(true);
            gl.enable(gl.DEPTH_TEST);
        }

        const renderDrawPass = orderingIndex => dataframes.forEach(dataframe => {
            let freeTexUnit = 0;
            let metaRenderer = null;
            if (!viz.symbol.default) {
                metaRenderer = viz.symbolMetaShader;
            } else if (dataframe.type === GEOMETRY_TYPE.POINT) {
                metaRenderer = viz.pointMetaShader;
            } else if (dataframe.type === GEOMETRY_TYPE.LINE) {
                metaRenderer = viz.lineMetaShader;
            } else {
                metaRenderer = viz.polygonMetaShader;
            }
            const renderer = metaRenderer.shader;
            gl.useProgram(renderer.program);

            // Set filtering condition on "... AND feature is in current order bucket"
            gl.uniform1f(renderer.orderMinWidth, orderingMins[orderingIndex]);
            gl.uniform1f(renderer.orderMaxWidth, orderingMaxs[orderingIndex]);

            // Define some scalar uniforms
            gl.uniform1f(renderer.normalScale, 1 / (Math.pow(2, drawMetadata.zoomLevel) * RESOLUTION_ZOOMLEVEL_ZERO * dataframe.scale));
            gl.uniform2f(renderer.resolution, gl.canvas.width / window.devicePixelRatio, gl.canvas.height / window.devicePixelRatio);

            gl.enableVertexAttribArray(renderer.vertexPositionAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, dataframe.vertexBuffer);
            gl.vertexAttribPointer(renderer.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);

            gl.enableVertexAttribArray(renderer.featureIdAttr);
            gl.bindBuffer(gl.ARRAY_BUFFER, dataframe.featureIDBuffer);
            gl.vertexAttribPointer(renderer.featureIdAttr, 2, gl.FLOAT, false, 0, 0);

            if (dataframe.type === GEOMETRY_TYPE.LINE || dataframe.type === GEOMETRY_TYPE.POLYGON) {
                gl.enableVertexAttribArray(renderer.normalAttr);
                gl.bindBuffer(gl.ARRAY_BUFFER, dataframe.normalBuffer);
                gl.vertexAttribPointer(renderer.normalAttr, 2, gl.FLOAT, false, 0, 0);
            }

            // Common Style textures
            gl.activeTexture(gl.TEXTURE0 + freeTexUnit);
            gl.bindTexture(gl.TEXTURE_2D, dataframe.texColor);
            gl.uniform1i(renderer.colorTexture, freeTexUnit);
            freeTexUnit++;

            gl.activeTexture(gl.TEXTURE0 + freeTexUnit);
            gl.bindTexture(gl.TEXTURE_2D, dataframe.texFilter);
            gl.uniform1i(renderer.filterTexture, freeTexUnit);
            freeTexUnit++;

            // Specific Style textures
            if (dataframe.type === 'point' || dataframe.type === 'line') {
                gl.activeTexture(gl.TEXTURE0 + freeTexUnit);
                gl.bindTexture(gl.TEXTURE_2D, dataframe.texWidth);
                gl.uniform1i(renderer.widthTexture, freeTexUnit);
                freeTexUnit++;
            }

            if (!viz.symbol.default) {
                const textureId = metaRenderer.textureIds;
                // Enforce that property texture and style texture TextureUnits don't clash with auxiliar ones
                drawMetadata.freeTexUnit = freeTexUnit + Object.keys(textureId).length;
                viz.symbol._setTimestamp(timestamp);
                viz.symbol._preDraw(renderer.program, drawMetadata, gl);

                viz.symbolPlacement._setTimestamp(timestamp);
                viz.symbolPlacement._preDraw(renderer.program, drawMetadata, gl);

                freeTexUnit = drawMetadata.freeTexUnit;

                Object.keys(textureId).forEach(name => {
                    gl.activeTexture(gl.TEXTURE0 + freeTexUnit);
                    gl.bindTexture(gl.TEXTURE_2D, dataframe.getPropertyTexture(name));
                    gl.uniform1i(textureId[name], freeTexUnit);
                    freeTexUnit++;
                });
            } else if (dataframe.type !== GEOMETRY_TYPE.LINE) {
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

            if (dataframe.type === GEOMETRY_TYPE.LINE || dataframe.type === GEOMETRY_TYPE.POLYGON) {
                gl.clear(gl.DEPTH_BUFFER_BIT); // antialising-related
            }

            if (!viz.transform.default) {
                const textureId = metaRenderer.textureIds;
                // Enforce that property texture and style texture TextureUnits don't clash with auxiliar ones
                drawMetadata.freeTexUnit = freeTexUnit + Object.keys(textureId).length;
                viz.transform._setTimestamp(timestamp);
                viz.transform._preDraw(renderer.program, drawMetadata, gl);

                freeTexUnit = drawMetadata.freeTexUnit;

                Object.keys(textureId).forEach(name => {
                    gl.activeTexture(gl.TEXTURE0 + freeTexUnit);
                    gl.bindTexture(gl.TEXTURE_2D, dataframe.getPropertyTexture(name));
                    gl.uniform1i(textureId[name], freeTexUnit);
                    freeTexUnit++;
                });

                gl.uniform2f(renderer.resolution, gl.canvas.width, gl.canvas.height); // remove it ? (duplicated)
            }

            gl.uniformMatrix4fv(renderer.matrix, false, dataframe.matrix);

            gl.drawArrays(gl.TRIANGLES, 0, dataframe.numVertex);

            // Some cleaning...
            gl.disableVertexAttribArray(renderer.vertexPositionAttribute);
            gl.disableVertexAttribArray(renderer.featureIdAttr);
            if (dataframe.type === GEOMETRY_TYPE.LINE || dataframe.type === GEOMETRY_TYPE.POLYGON) {
                gl.disableVertexAttribArray(renderer.normalAttr);
                gl.disable(gl.DEPTH_TEST);
            }
        });
        orderingMins.map((_, orderingIndex) => {
            renderDrawPass(orderingIndex);
        });

        if (renderLayer.type !== GEOMETRY_TYPE.POINT) {
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

        gl.disable(gl.CULL_FACE); // ? not needed from v0.50?
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

function getValidWebGLContextOrThrow (canvas, gl) {
    const reasons = unsupportedBrowserReasons(canvas, gl, true);
    if (reasons.length > 0) {
        throw reasons[0];
    }
    return gl;
}

export function isBrowserSupported (canvas, gl) {
    const reasons = unsupportedBrowserReasons(canvas, gl);
    return reasons.length === 0;
}

export function unsupportedBrowserReasons (canvas, gl, early = false) {
    const reasons = [];
    if (!gl) {
        if (!canvas) {
            canvas = document.createElement('canvas');
        }
        gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    }
    if (!gl) {
        reasons.push(new CartoRuntimeError(`${crt.WEB_GL} WebGL 1 is unsupported`));
        return reasons;
    }

    const OESTextureFloat = gl.getExtension('OES_texture_float');
    if (!OESTextureFloat) {
        reasons.push(new CartoRuntimeError(`${crt.WEB_GL} WebGL extension 'OES_texture_float' is unsupported`));
        if (early) {
            return reasons;
        }
    }

    const supportedRTT = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
    if (supportedRTT < RTT_WIDTH) {
        reasons.push(new CartoRuntimeError(`${crt.WEB_GL} WebGL parameter 'gl.MAX_RENDERBUFFER_SIZE' is below the requirement: ${supportedRTT} < ${RTT_WIDTH}`));
    }

    return reasons;
}
