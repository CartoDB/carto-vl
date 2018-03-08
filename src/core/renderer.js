import * as shaders from './shaders';
import * as schema from './schema';
import Dataframe from './dataframe';
import { Asc, Desc } from './style/functions';

const HISTOGRAM_BUCKETS = 1000;

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
const RTT_WIDTH = 1024;


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

class Renderer {
    constructor(canvas) {
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
        console.log('R', this);
        this.dataframes = [];
    }

    _initGL(gl) {
        this.gl = gl;
        const OES_texture_float = gl.getExtension('OES_texture_float');
        if (!OES_texture_float) {
            throw new Error('WebGL extension OES_texture_float is unsupported');
        }
        const OES_texture_float_linear = gl.getExtension('OES_texture_float_linear');
        if (!OES_texture_float_linear) {
            throw new Error('WebGL extension OES_texture_float_linear is unsupported');
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
        var vertices = [
            10.0, -10.0,
            0.0, 10.0,
            -10.0, -10.0,
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

        this._HMTex = gl.createTexture();
        this._HMRamp = gl.createTexture();
        this._HMFB = gl.createFramebuffer();

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, this.zeroTex);
    }

    /**
    * Get Renderer visualization center
    * @return {RPoint}
    */
    getCenter() {
        return { x: this._center.x, y: this._center.y };
    }

    /**
     * Set Renderer visualization center
     * @param {number} x
     * @param {number} y
     */
    setCenter(x, y) {
        this._center.x = x;
        this._center.y = y;
    }

    /**
     * Get Renderer visualization bounds
     * @return {*}
     */
    getBounds() {
        const center = this.getCenter();
        const sx = this.getZoom() * this.getAspect();
        const sy = this.getZoom();
        return [center.x - sx, center.y - sy, center.x + sx, center.y + sy];
    }

    /**
     * Get Renderer visualization zoom
     * @return {number}
     */
    getZoom() {
        return this._zoom;
    }

    /**
     * Set Renderer visualization zoom
     * @param {number} zoom
     */
    setZoom(zoom) {
        this._zoom = zoom;
    }


    /**
     * Removes a dataframe for the renderer. Freeing its resources.
     * @param {*} tile
     */
    removeDataframe(dataframe) {
        this.dataframes = this.dataframes.filter(t => t !== dataframe);
    }

    /**
     * @description Adds a new dataframe to the renderer.
     *
     * Performance-intensive. The required allocation and copy of resources will happen synchronously.
     * To achieve good performance, avoid multiple calls within the same event, particularly with large dataframes.
     * @param {Dataframe} dataframe
     * @returns {BoundDataframe}
     */
    addDataframe(dataframe) {
        dataframe.bind(this);
        this.dataframes.push(dataframe);
    }

    getAspect() {
        if (this.gl) {
            return this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        }
        return 1;
    }


    getStyledTiles() {
        return this.dataframes.filter(tile => tile.style && tile.visible && tile.style.colorShader);
    }


    _computeDrawMetadata() {
        const aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        const tiles = this.getStyledTiles();
        let drawMetadata = {
            freeTexUnit: 4,
            zoom: 1. / this._zoom,
            columns: []
        };
        let requiredColumns = tiles.map(d => {
            const colorRequirements = d.style.getColor()._getDrawMetadataRequirements();
            const widthRequirements = d.style.getWidth()._getDrawMetadataRequirements();
            const strokeColorRequirements = d.style.getStrokeColor()._getDrawMetadataRequirements();
            const strokeWidthRequirements = d.style.getStrokeWidth()._getDrawMetadataRequirements();
            const filterRequirements = d.style.filter._getDrawMetadataRequirements();
            return [widthRequirements, colorRequirements, strokeColorRequirements, strokeWidthRequirements, filterRequirements].
                reduce(schema.union, schema.IDENTITY);
        }).reduce(schema.union, schema.IDENTITY).columns;

        requiredColumns.map(column => {
            drawMetadata.columns.push(
                {
                    name: column,
                    min: Number.POSITIVE_INFINITY,
                    max: Number.NEGATIVE_INFINITY,
                    avg: undefined,
                    count: 0,
                    sum: 0,
                    histogramBuckets: HISTOGRAM_BUCKETS,
                    histogram: Array.from({ length: HISTOGRAM_BUCKETS }, () => 0),
                    accumHistogram: Array.from({ length: HISTOGRAM_BUCKETS }, () => 0),
                }
            );
        });

        const s = 1. / this._zoom;
        tiles.map(d => {
            requiredColumns.map(column => {
                const values = d.properties[column];
                let min = Number.POSITIVE_INFINITY;
                let max = Number.NEGATIVE_INFINITY;
                let sum = 0;
                let count = 0;
                d.vertexScale = [(s / aspect) * d.scale, s * d.scale];
                d.vertexOffset = [(s / aspect) * (this._center.x - d.center.x), s * (this._center.y - d.center.y)];
                const minx = (-1 + d.vertexOffset[0]) / d.vertexScale[0];
                const maxx = (1 + d.vertexOffset[0]) / d.vertexScale[0];
                const miny = (-1 + d.vertexOffset[1]) / d.vertexScale[1];
                const maxy = (1 + d.vertexOffset[1]) / d.vertexScale[1];
                for (let i = 0; i < d.numFeatures; i++) {
                    const x = d.geom[2 * i + 0];
                    const y = d.geom[2 * i + 1];
                    if (x > minx && x < maxx && y > miny && y < maxy) {
                        const v = values[i];
                        if (!Number.isFinite(v)) {
                            continue;
                        }
                        sum += v;
                        min = Math.min(min, v);
                        max = Math.max(max, v);
                        count++;
                    }
                }
                const metaColumn = drawMetadata.columns.find(c => c.name == column);
                metaColumn.min = Math.min(min, metaColumn.min);
                metaColumn.max = Math.max(max, metaColumn.max);
                metaColumn.count += count;
                metaColumn.sum += sum;
            });
        });
        requiredColumns.map(column => {
            const metaColumn = drawMetadata.columns.find(c => c.name == column);
            metaColumn.avg = metaColumn.sum / metaColumn.count;
        });
        tiles.map(d => {
            requiredColumns.map(column => {
                const values = d.properties[column];
                const metaColumn = drawMetadata.columns.find(c => c.name == column);
                d.vertexScale = [(s / aspect) * d.scale, s * d.scale];
                d.vertexOffset = [(s / aspect) * (this._center.x - d.center.x), s * (this._center.y - d.center.y)];
                const minx = (-1 + d.vertexOffset[0]) / d.vertexScale[0];
                const maxx = (1 + d.vertexOffset[0]) / d.vertexScale[0];
                const miny = (-1 + d.vertexOffset[1]) / d.vertexScale[1];
                const maxy = (1 + d.vertexOffset[1]) / d.vertexScale[1];
                const vmin = metaColumn.min;
                const vmax = metaColumn.max;
                const vdiff = vmax - vmin;
                for (let i = 0; i < d.numFeatures; i++) {
                    const x = d.geom[2 * i + 0];
                    const y = d.geom[2 * i + 1];
                    if (x > minx && x < maxx && y > miny && y < maxy) {
                        const v = values[i];
                        if (!Number.isFinite(v)) {
                            continue;
                        }
                        metaColumn.histogram[Math.ceil(999 * (v - vmin) / vdiff)]++;
                    }
                }
            });
        });
        requiredColumns.map(column => {
            const metaColumn = drawMetadata.columns.find(c => c.name == column);
            for (let i = 1; i < metaColumn.histogramBuckets; i++) {
                metaColumn.accumHistogram[i] = metaColumn.accumHistogram[i - 1] + metaColumn.histogram[i];
            }
        });
        return drawMetadata;
    }

    refresh(timestamp) {
        const gl = this.gl;
        // Don't re-render more than once per animation frame
        if (this.lastFrame === timestamp) {
            return;
        }

        var width = gl.canvas.clientWidth;
        var height = gl.canvas.clientHeight;
        if (gl.canvas.width != width ||
            gl.canvas.height != height) {
            gl.canvas.width = width;
            gl.canvas.height = height;
        }
        var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

        gl.enable(gl.CULL_FACE);

        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.STENCIL_TEST);
        gl.depthMask(false);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.auxFB);

        const tiles = this.getStyledTiles();

        const drawMetadata = this._computeDrawMetadata();

        const styleTile = (tile, tileTexture, shader, styleExpr, TID) => {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tileTexture, 0);
            gl.viewport(0, 0, RTT_WIDTH, tile.height);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(shader.program);
            for (let i = 0; i < 16; i++) {
                gl.activeTexture(gl.TEXTURE0 + i);
                gl.bindTexture(gl.TEXTURE_2D, this.zeroTex);
                gl.uniform1i(shader.textureLocations[i], 0);
            }

            drawMetadata.freeTexUnit = 4;
            styleExpr._preDraw(drawMetadata, gl);

            Object.keys(TID).forEach((name, i) => {
                gl.activeTexture(gl.TEXTURE0 + i);
                gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[tile.propertyID[name]]);
                gl.uniform1i(shader.textureLocations[i], i);
            });

            gl.enableVertexAttribArray(shader.vertexAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bigTriangleVBO);
            gl.vertexAttribPointer(shader.vertexAttribute, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLES, 0, 3);
            gl.disableVertexAttribArray(shader.vertexAttribute);
        };
        tiles.map(tile => styleTile(tile, tile.texColor, tile.style.colorShader, tile.style.getColor(), tile.style.propertyColorTID));
        tiles.map(tile => styleTile(tile, tile.texWidth, tile.style.widthShader, tile.style.getWidth(), tile.style.propertyWidthTID));
        tiles.map(tile => styleTile(tile, tile.texStrokeColor, tile.style.strokeColorShader, tile.style.getStrokeColor(), tile.style.propertyStrokeColorTID));
        tiles.map(tile => styleTile(tile, tile.texStrokeWidth, tile.style.strokeWidthShader, tile.style.getStrokeWidth(), tile.style.propertyStrokeWidthTID));
        tiles.map(tile => styleTile(tile, tile.texFilter, tile.style.filterShader, tile.style.filter, tile.style.propertyFilterTID));

        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

        if (tiles.length && tiles[0].type != 'point') {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this._AAFB);
            const [w, h] = [gl.drawingBufferWidth, gl.drawingBufferHeight];

            if (w != this._width || h != this._height) {
                console.log('creating fb AA');
                gl.bindTexture(gl.TEXTURE_2D, this._AATex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                    w * 2, h * 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._AATex, 0);

                [this._width, this._height] = [w, h];
            }
            gl.viewport(0, 0, w * 2, h * 2);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }

        const heatmapRes = 64;
        // RENDER TO HM FB
        if (tiles.length && tiles[0].type == 'point') {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this._HMFB);
            const [w, h] = [gl.drawingBufferWidth, gl.drawingBufferHeight];

            const scale = 1 / 32;
            const [ws, hs] = [heatmapRes,heatmapRes];[Math.round(w * scale), Math.round(h * scale)];
            this.soff = ws / w / scale;

            // FIXME CONDITION
            if (w != this._width || h != this._height) {
                console.log('creating fb', w * scale, h * scale, ws, hs);
                console.log(ws / w / scale);
                gl.bindTexture(gl.TEXTURE_2D, this._HMTex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                    ws, hs, 0, gl.RGBA, gl.FLOAT, null);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._HMTex, 0);

                [this._width, this._height] = [w, h];
                console.log('complete: ', gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE);

                const colors = [

                    '#009392',
                    '#39b185',
                    '#9ccb86',
                    '#e9e29c',
                    '#eeb479',
                    '#e88471',
                    '#cf597e'

                ];
                // console.log(this.input.numCategories, this.input.othersBucket, colors, this);
                function hexToRgb(hex) {
                    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    return result ? {
                        r: parseInt(result[1], 16),
                        g: parseInt(result[2], 16),
                        b: parseInt(result[3], 16)
                    } : null;
                }
                const level = 0;
                const internalFormat = gl.RGBA;
                const width = 256;
                const height = 1;
                const border = 0;
                const srcFormat = gl.RGBA;
                const srcType = gl.UNSIGNED_BYTE;
                const pixel = new Uint8Array(4 * width);
                for (var i = 0; i < width; i++) {
                    const vlowRaw = colors[Math.floor(i / width * (colors.length - 1))];
                    const vhighRaw = colors[Math.ceil(i / width * (colors.length - 1))];
                    const vlow = [hexToRgb(vlowRaw).r, hexToRgb(vlowRaw).g, hexToRgb(vlowRaw).b, 255];
                    const vhigh = [hexToRgb(vhighRaw).r, hexToRgb(vhighRaw).g, hexToRgb(vhighRaw).b, 255];
                    const m = i / width * (colors.length - 1) - Math.floor(i / width * (colors.length - 1));
                    const v = vlow.map((low, index) => low * (1. - m) + vhigh[index] * m);
                    pixel[4 * i + 0] = v[0];
                    pixel[4 * i + 1] = v[1];
                    pixel[4 * i + 2] = v[2];
                    pixel[4 * i + 3] = v[3];
                }
                gl.bindTexture(gl.TEXTURE_2D, this._HMRamp);
                gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    width, height, border, srcFormat, srcType,
                    pixel);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            }
            gl.viewport(0, 0, ws, hs);

            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            // SET ACUMULATIVE BLENDING
            gl.blendFunc(gl.ONE, gl.ONE);
            gl.blendEquation(gl.FUNC_ADD);
        }

        let s = 1. / this._zoom * (1 - this.soff * 0);
        const newS = (Math.pow(2, Math.floor(Math.log2(s * (heatmapRes-1) / heatmapRes))));
        const sDiff = s / newS;
        s = newS;
        //console.log(s, sDiff);

        const { orderingMins, orderingMaxs } = getOrderingRenderBuckets(tiles);

        const renderDrawPass = orderingIndex => tiles.forEach(tile => {
            let renderer = null;
            if (tile.type == 'point') {
                renderer = this.finalRendererProgram;
            } else if (tile.type == 'line') {
                renderer = this.lineRendererProgram;
            } else {
                renderer = this.triRendererProgram;
            }
            gl.useProgram(renderer.program);

            //Set filtering condition on "... AND feature is in current order bucket"
            gl.uniform1f(renderer.orderMinWidth, orderingMins[orderingIndex]);
            gl.uniform1f(renderer.orderMaxWidth, orderingMaxs[orderingIndex]);

            gl.uniform2f(renderer.vertexScaleUniformLocation,
                (s / aspect) * tile.scale,
                s * tile.scale);


            tile.vertexScale = [(s / aspect) * tile.scale, s * tile.scale];

            tile.vertexOffset = [(this._center.x - tile.center.x), (this._center.y - tile.center.y)];
            tile.vertexOffset = [(s / aspect) * tile.vertexOffset[0], s * tile.vertexOffset[1]];

            const ko = heatmapRes / 2;
            //tile.vertexOffset[0]+=1/2/ko;
            //tile.vertexOffset[1]+=0.125/ko;
            tile.hmVertexOffset = tile.vertexOffset.map(c => c - Math.round(c * ko) / (ko));
            tile.vertexOffset = tile.vertexOffset.map(c => Math.round(c * ko) / (ko));


            gl.uniform2f(renderer.vertexOffsetUniformLocation,
                tile.vertexOffset[0],
                tile.vertexOffset[1]);

            gl.enableVertexAttribArray(renderer.vertexPositionAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, tile.vertexBuffer);
            gl.vertexAttribPointer(renderer.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);


            gl.enableVertexAttribArray(renderer.featureIdAttr);
            gl.bindBuffer(gl.ARRAY_BUFFER, tile.featureIDBuffer);
            gl.vertexAttribPointer(renderer.featureIdAttr, 2, gl.FLOAT, false, 0, 0);

            if (tile.type == 'line') {
                gl.enableVertexAttribArray(renderer.normalAttr);
                gl.bindBuffer(gl.ARRAY_BUFFER, tile.normalBuffer);
                gl.vertexAttribPointer(renderer.normalAttr, 2, gl.FLOAT, false, 0, 0);
            }

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, tile.texColor);
            gl.uniform1i(renderer.colorTexture, 0);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, tile.texWidth);
            gl.uniform1i(renderer.widthTexture, 1);


            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, tile.texFilter);
            gl.uniform1i(renderer.filterTexture, 2);

            if (tile.type == 'point') {
                // Lines and polygons don't support stroke
                gl.activeTexture(gl.TEXTURE3);
                gl.bindTexture(gl.TEXTURE_2D, tile.texStrokeColor);
                gl.uniform1i(renderer.colorStrokeTexture, 3);

                gl.activeTexture(gl.TEXTURE4);
                gl.bindTexture(gl.TEXTURE_2D, tile.texStrokeWidth);
                gl.uniform1i(renderer.strokeWidthTexture, 4);
            }

            gl.drawArrays(tile.type == 'point' ? gl.POINTS : gl.TRIANGLES, 0, tile.numVertex);

            gl.disableVertexAttribArray(renderer.vertexPositionAttribute);
            gl.disableVertexAttribArray(renderer.featureIdAttr);
            if (tile.type == 'line') {
                gl.disableVertexAttribArray(renderer.normalAttr);
            }
        });
        orderingMins.map((_, orderingIndex) => {
            renderDrawPass(orderingIndex);
        });

        if (tiles.length && tiles[0].type != 'point') {
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

        // BLEND TO FB 0
        if (tiles.length && tiles[0].type == 'point') {



            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

            gl.useProgram(this._hmBlendShader.program);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this._HMTex);
            gl.uniform1i(this._hmBlendShader.readTU, 0);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this._HMRamp);
            gl.uniform1i(this._hmBlendShader.ramp, 1);

            window.K = window.K || 10;
            gl.uniform1f(this._hmBlendShader.K, window.K * s / 1000);


            gl.uniform2fv(this._hmBlendShader.offset, tiles[0].hmVertexOffset);
            gl.uniform2fv(this._hmBlendShader.scale, [1 / sDiff, 1 / sDiff]);

            gl.enableVertexAttribArray(this._hmBlendShader.vertexAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.bigTriangleVBO);
            gl.vertexAttribPointer(this._hmBlendShader.vertexAttribute, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLES, 0, 3);
            gl.disableVertexAttribArray(this._hmBlendShader.vertexAttribute);
        }

        gl.disable(gl.CULL_FACE);
    }


    /**
     * Initialize static shaders
     */
    _initShaders() {
        this.finalRendererProgram = shaders.renderer.createPointShader(this.gl);
        this.triRendererProgram = shaders.renderer.createTriShader(this.gl);
        this.lineRendererProgram = shaders.renderer.createLineShader(this.gl);
        this._aaBlendShader = new shaders.AABlender(this.gl);
        this._hmBlendShader = new shaders.HMBlender(this.gl);
    }
}

function getOrderingRenderBuckets(tiles) {
    let orderer = null;
    if (tiles.length > 0) {
        orderer = tiles[0].style.getOrder();
    }
    let orderingMins = [0];
    let orderingMaxs = [1000];
    if (orderer instanceof Asc) {
        orderingMins = Array.from({ length: 16 }, (_, i) => (15 - i) * 2);
        orderingMaxs = Array.from({ length: 16 }, (_, i) => i == 0 ? 1000 : (15 - i + 1) * 2);
    } else if (orderer instanceof Desc) {
        orderingMins = Array.from({ length: 16 }, (_, i) => i * 2);
        orderingMaxs = Array.from({ length: 16 }, (_, i) => i == 15 ? 1000 : (i + 1) * 2);
    }
    return {
        orderingMins,
        orderingMaxs
    };
}

export { Renderer, Dataframe, schema };
