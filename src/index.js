import * as shaders from './shaders';
import * as Style from './style';
import * as schema from './schema';

export { Renderer, Style };
export { Schema } from './schema';

/**
 * @api
 * @typedef {object} RPoint - Point in renderer coordinates space
 * @property {number} x
 * @property {number} y
 */

/**
 * @api
 * @typedef {object} Dataframe - Point in renderer coordinates space
 * @property {RPoint} center
 * @property {number} scale
 * @property {geom} geometry
 * @property {Properties} properties
 */


// TODO remove
var gl;

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
 * @api
 * @memberOf renderer
 * @constructor
 * @param {HTMLElement} canvas - the WebGL context will be created on this element
 */
function Renderer(canvas) {
    this.canvas = canvas;
    this.tiles = [];
    if (!gl) { //TODO remove hack: remove global context
        gl = canvas.getContext('webgl');
        if (!gl) {
            throw new Error("WebGL extension OES_texture_float is unsupported");
        }
        var ext = gl.getExtension("OES_texture_float");
        if (!ext) {
            throw new Error("WebGL extension OES_texture_float is unsupported");
        }
        const supportedRTT = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
        if (supportedRTT < RTT_WIDTH) {
            throw new Error(`WebGL parameter 'gl.MAX_RENDERBUFFER_SIZE' is below the requirement: ${supportedRTT} < ${RTT_WIDTH}`);
        }
        Style.setGL(gl);
        this._initShaders();
        this._center = { x: 0, y: 0 };
        this._zoom = 1;
    }
    this.squareBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuffer);
    var vertices = [
        10.0, -10.0,
        0.0, 10.0,
        -10.0, -10.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

/**
 * Get Renderer visualization center
 * @api
 * @return {RPoint}
 */
Renderer.prototype.getCenter = function () {
    return { x: this._center.x, y: this._center.y };
};
/**
 * Set Renderer visualization center
 * @api
 * @param {number} x
 * @param {number} y
 */
Renderer.prototype.setCenter = function (x, y) {
    this._center.x = x;
    this._center.y = y;
    window.requestAnimationFrame(refresh.bind(this));
};
/**
 * Get Renderer visualization zoom
 * @api
 * @return {number}
 */
Renderer.prototype.getZoom = function () {
    return this._zoom;
};
/**
 * Set Renderer visualization zoom
 * @api
 * @param {number} zoom
 */
Renderer.prototype.setZoom = function (zoom) {
    this._zoom = zoom;
    window.requestAnimationFrame(refresh.bind(this));
};

/**
 * Removes a dataframe for the renderer. Freeing its resources.
 * @api
 * @param {*} tile
 */
Renderer.prototype.removeDataframe = function (dataframe) {
    this.tiles = this.tiles.filter(t => t !== dataframe);
    dataframe.propertyTex.map(tex => gl.deleteTexture(tex));
    gl.deleteTexture(dataframe.texColor);
    gl.deleteTexture(dataframe.texWidth);
    gl.deleteBuffer(dataframe.vertexBuffer);
    gl.deleteBuffer(dataframe.featureIDBuffer);
};

/**
 * @constructor
 * @api
 */
function Dataframe() {
}
/**
 * @api
 * Aply a style
 * @param style
 */
Dataframe.prototype.applyStyle = function (style) {

}

/**
 * @api
 * @description Adds a new dataframe to the renderer.
 *
 * Performance-intensive. The required allocation and copy of resources will happen synchronously.
 * To achieve good performance, avoid multiple calls within the same event, particularly with large dataframes.
 * @param {Dataframe} dataframe
 * @returns {Dataframse} asd
 */
Renderer.prototype.addDataframe = function (tile) {
    this.tiles.push(tile);
    tile.propertyTex = [];

    var points = tile.geom;
    const level = 0;
    const width = RTT_WIDTH;
    tile.numVertex = points.length / 2;
    const height = Math.ceil(tile.numVertex / width);
    const border = 0;
    const srcFormat = gl.RED;
    const srcType = gl.FLOAT;
    tile.height = height;
    tile.propertyID = {}; //Name => PID
    tile.propertyCount = 0;


    for (var k in tile.properties) {
        if (tile.properties.hasOwnProperty(k) && tile.properties[k].length > 0) {
            const isCategory = !Number.isFinite(tile.properties[k][0]);
            const property = tile.properties[k];
            var propertyID = tile.propertyID[k];
            if (propertyID === undefined) {
                propertyID = tile.propertyCount;
                tile.propertyCount++;
                tile.propertyID[k] = propertyID;
            }
            tile.propertyTex[propertyID] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[propertyID]);
            const pixel = new Float32Array(width * height);
            for (var i = 0; i < property.length; i++) {
                pixel[i] = property[i];
            }
            gl.texImage2D(gl.TEXTURE_2D, level, gl.ALPHA,
                width, height, 0, gl.ALPHA, srcType,
                pixel);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }
    }

    tile.setStyle = function (style) {
        schema.checkSchemaMatch(style.schema, tile.schema);
        this.style = style;
    }
    tile.style = null;

    tile.vertexBuffer = gl.createBuffer();
    tile.featureIDBuffer = gl.createBuffer();


    tile.texColor = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tile.texColor);
    gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA,
        width, height, border, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array(4 * width * height).fill(255));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    tile.texWidth = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tile.texWidth);
    gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA,
        width, height, border, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array(4 * width * height).fill(100));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);



    var ids = new Float32Array(points.length);
    for (var i = 0; i < points.length; i += 2) {
        ids[i + 0] = ((i / 2) % width) / width;
        ids[i + 1] = Math.floor((i / 2) / width) / height;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, tile.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, tile.featureIDBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, ids, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    window.requestAnimationFrame(refresh.bind(this));

    return tile;
};

/**
 * Refresh the canvas by redrawing everything needed.
 * Should only be called by requestAnimationFrame
 * @param timestamp - timestamp of the animation provided by requestAnimationFrame
 */
Renderer.prototype.refresh = refresh;
function refresh(timestamp) {
    // Don't re-render more than once per animation frame
    if (this.lastFrame == timestamp) {
        return;
    }
    this.lastFrame = timestamp;
    var canvas = this.canvas;
    var width = gl.canvas.clientWidth;
    var height = gl.canvas.clientHeight;
    if (gl.canvas.width != width ||
        gl.canvas.height != height) {
        gl.canvas.width = width;
        gl.canvas.height = height;
    }
    var aspect = canvas.clientWidth / canvas.clientHeight;
    gl.clearColor(0., 0., 0., 0.);//TODO this should be a renderer property
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.CULL_FACE);

    //TODO refactor condition
    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);

    if (!this.auxFB) {
        this.auxFB = gl.createFramebuffer();
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.auxFB);
    //console.log("Restyle", timestamp)
    // Render To Texture
    // COLOR
    this.tiles.forEach(tile => {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tile.texColor, 0);
        gl.viewport(0, 0, RTT_WIDTH, tile.height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(tile.style.colorShader.program);
        var obj = {
            freeTexUnit: 4
        }
        tile.style._color._preDraw(obj);

        Object.keys(tile.style.propertyColorTID).forEach((name, i) => {
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[tile.propertyID[name]]);
            gl.uniform1i(tile.style.colorShader.textureLocations[i], i);
        });

        gl.enableVertexAttribArray(this.colorShaderVertex);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuffer);
        gl.vertexAttribPointer(tile.style.colorShader.vertexAttribute, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
    });

    //WIDTH
    this.tiles.forEach(tile => {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tile.texWidth, 0);
        gl.useProgram(tile.style.widthShader.program);
        gl.viewport(0, 0, RTT_WIDTH, tile.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        var obj = {
            freeTexUnit: 4
        }
        tile.style._width._preDraw(obj);
        Object.keys(tile.style.propertyWidthTID).forEach((name, i) => {
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[tile.propertyID[name]]);
            gl.uniform1i(tile.style.widthShader.textureLocations[i], i);
        });

        gl.enableVertexAttribArray(tile.style.widthShader.vertexAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuffer);
        gl.vertexAttribPointer(tile.style.widthShader.vertexAttribute, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 3);

        tile.style.updated = false;
        tile.initialized = true;
    });


    gl.disable(gl.DEPTH_TEST);

    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    gl.useProgram(this.finalRendererProgram.program);
    var s = 1. / this._zoom;


    this.tiles.forEach(tile => {
        /*console.log((s / aspect) * tile.scale,
            s * tile.scale,
            (s / aspect) * this._center.x - tile.center.x,
            s * this._center.y - tile.center.y
        );*/
        gl.uniform2f(this.finalRendererProgram.vertexScaleUniformLocation,
            (s / aspect) * tile.scale,
            s * tile.scale);
        gl.uniform2f(this.finalRendererProgram.vertexOffsetUniformLocation,
            (s / aspect) * (this._center.x - tile.center.x),
            s * (this._center.y - tile.center.y));

        gl.enableVertexAttribArray(this.finalRendererProgram.vertexPositionAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, tile.vertexBuffer);
        gl.vertexAttribPointer(this.finalRendererProgram.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);


        gl.enableVertexAttribArray(this.finalRendererProgram.featureIdAttr);
        gl.bindBuffer(gl.ARRAY_BUFFER, tile.featureIDBuffer);
        gl.vertexAttribPointer(this.finalRendererProgram.featureIdAttr, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tile.texColor);
        gl.uniform1i(this.finalRendererProgram.colorTexture, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, tile.texWidth);
        gl.uniform1i(this.finalRendererProgram.widthTexture, 1);

        gl.drawArrays(gl.POINTS, 0, tile.numVertex);

    });

    this.tiles.forEach(t => {
        if (t.style._color.isAnimated() || t.style._width.isAnimated()) {
            window.requestAnimationFrame(refresh.bind(this));
        }
    });
}

/**
 * Initialize static shaders
 */
Renderer.prototype._initShaders = function () {
    this.finalRendererProgram = shaders.renderer.createPointShader(gl);
}
