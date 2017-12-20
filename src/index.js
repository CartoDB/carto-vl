import * as shaders from './shaders';
import * as Style from './style';
import * as schema from './schema';

export { Renderer, Style, Dataframe };

import * as schema from './schema';
export { schema };

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
function Renderer(canvas) {
    this.canvas = canvas;
    this.tiles = [];
    this.fbPool = [];
    this.computePool = [];
    if (!this.gl) { //TODO remove hack: remove global context
        this.gl = canvas.getContext('webgl');
        const gl = this.gl;
        if (!gl) {
            throw new Error("WebGL extension OES_texture_float is unsupported");
        }
        var ext = gl.getExtension("OES_texture_float");
        if (!ext) {
            throw new Error("WebGL extension OES_texture_float is unsupported");
        }
        this.EXT_blend_minmax = gl.getExtension('EXT_blend_minmax');
        if (!this.EXT_blend_minmax) {
            throw new Error("WebGL extension EXT_blend_minmax is unsupported");
        }
        const supportedRTT = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
        if (supportedRTT < RTT_WIDTH) {
            throw new Error(`WebGL parameter 'gl.MAX_RENDERBUFFER_SIZE' is below the requirement: ${supportedRTT} < ${RTT_WIDTH}`);
        }
        this._initShaders();
        this._center = { x: 0, y: 0 };
        this._zoom = 1;
    }
    const gl = this.gl;
    this.auxFB = gl.createFramebuffer();
    this.squareBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuffer);
    var vertices = [
        10.0, -10.0,
        0.0, 10.0,
        -10.0, -10.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    this.zerotex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.zerotex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
        1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array(4));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
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
 * Get Renderer visualization center
 * @api
 * @return {*}
 */
Renderer.prototype.getBounds = function () {
    const center = this.getCenter();
    const sx = this.getZoom() * this.getAspect();
    const sy = this.getZoom();
    return [center.x - sx, center.y - sy, center.x + sx, center.y + sy];
}
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
};


class Dataframe {
    /**
     * @constructor
     * @jsapi
     */
    constructor(center, scale, geom, properties) {
        this.center = center;
        this.scale = scale;
        this.geom = geom;
        this.properties = properties;
    }
    free() {
        if (this.propertyTex) {
            const gl = this.renderer.gl;
            this.propertyTex.map(tex => gl.deleteTexture(tex));
            gl.deleteTexture(this.texColor);
            gl.deleteTexture(this.texStrokeColor);
            gl.deleteTexture(this.texWidth);
            gl.deleteTexture(this.texStrokeWidth);
            gl.deleteBuffer(this.vertexBuffer);
            gl.deleteBuffer(this.featureIDBuffer);
            this.texColor = 'freed';
            this.texStrokeColor = 'freed';
            this.texStrokeWidth = 'freed';
            this.vertexBuffer = 'freed';
            this.featureIDBuffer = 'freed';
            this.propertyTex = null;
        }
    }
}

class BoundDataframe extends Dataframe {
    /**
    * @jsapi
    * Apply a style
    * @name setStyle
    * @param style
    */
}

Renderer.prototype.createTileTexture = function (type, features) {
    const gl = this.gl;
    const width = RTT_WIDTH;
    const height = Math.ceil(features / width);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    if (type == 'size') {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA,
            width, height, 0, gl.ALPHA, gl.UNSIGNED_BYTE,
            null);
    } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
            width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            null);
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return texture;
}

/**
 * @jsapi
 * @description Adds a new dataframe to the renderer.
 *
 * Performance-intensive. The required allocation and copy of resources will happen synchronously.
 * To achieve good performance, avoid multiple calls within the same event, particularly with large dataframes.
 * @param {Dataframe} dataframe
 * @returns {BoundDataframe}
 */
Renderer.prototype.addDataframe = function (dataframe) {
    const gl = this.gl;
    this.tiles.push(dataframe);
    dataframe.propertyTex = [];

    var points = dataframe.geom;
    const level = 0;
    const width = RTT_WIDTH;
    dataframe.numVertex = points.length / 2;
    const height = Math.ceil(dataframe.numVertex / width);
    const border = 0;
    const srcFormat = gl.RED;
    const srcType = gl.FLOAT;
    dataframe.height = height;
    dataframe.propertyID = {}; //Name => PID
    dataframe.propertyCount = 0;
    dataframe.renderer = this;

    for (var k in dataframe.properties) {
        if (dataframe.properties.hasOwnProperty(k) && dataframe.properties[k].length > 0) {
            const isCategory = !Number.isFinite(dataframe.properties[k][0]);
            const property = dataframe.properties[k];
            var propertyID = dataframe.propertyID[k];
            if (propertyID === undefined) {
                propertyID = dataframe.propertyCount;
                dataframe.propertyCount++;
                dataframe.propertyID[k] = propertyID;
            }
            dataframe.propertyTex[propertyID] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, dataframe.propertyTex[propertyID]);
            gl.texImage2D(gl.TEXTURE_2D, level, gl.ALPHA,
                width, height, 0, gl.ALPHA, gl.FLOAT,
                dataframe.properties[k]);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        }
    }

    dataframe.setStyle = (style) => {
        dataframe.style = style;
        if (style) {
            schema.checkSchemaMatch(style.schema, dataframe.schema);
        }
        window.requestAnimationFrame(refresh.bind(this));
    }
    dataframe.style = null;

    dataframe.vertexBuffer = gl.createBuffer();
    dataframe.featureIDBuffer = gl.createBuffer();

    dataframe.texColor = this.createTileTexture('color', dataframe.numVertex);
    dataframe.texWidth = this.createTileTexture('color', dataframe.numVertex);
    dataframe.texStrokeColor = this.createTileTexture('color', dataframe.numVertex);
    dataframe.texStrokeWidth = this.createTileTexture('color', dataframe.numVertex);

    var ids = new Float32Array(points.length);
    for (var i = 0; i < points.length; i += 2) {
        ids[i + 0] = ((i / 2) % width) / (width - 1);
        ids[i + 1] = Math.floor((i / 2) / width) / (height - 1);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, dataframe.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, dataframe.featureIDBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, ids, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    window.requestAnimationFrame(refresh.bind(this));
    return dataframe;
};

Renderer.prototype.getAspect = function () {
    return this.canvas.clientWidth / this.canvas.clientHeight;
};

class ComputeJob {
    constructor(type, expressions, resolve) {
        this.type = type;
        this.expressions = expressions;
        this.resolve = resolve;
        this.status = 'pending';
    }
    work(renderer) {
        let sum = 0;
        renderer.tiles.filter(t => t.style).map(t => {
            /*for (let i=0; i<t.properties['temp'].length; i++){
                sum+=t.properties['temp'][i];
            }*/
            sum += t.numVertex;
        });
        this.resolve(sum);
        this.status = 'dispatched';
        return;
        if (this.status == 'pending') {
            this.status = 'sent';
            this.readback = renderer._compute(this.type, this.expressions);
        } else if (this.status == 'sent') {
            this.status = 'dispatched';
            this.resolve(this.readback());
        }
    }
}

/**
 * Refresh the canvas by redrawing everything needed.
 * Should only be called by requestAnimationFrame
 * @param timestamp - timestamp of the animation provided by requestAnimationFrame
 */
Renderer.prototype.refresh = refresh;
function refresh(timestamp) {
    const gl = this.gl;
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
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0., 0., 0., 0.);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.CULL_FACE);

    gl.disable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);

    // Render To Texture
    // COLOR
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.auxFB);


    const styleTile = (tile, tileTexture, shader, styleExpr, TID) => {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tileTexture, 0);
        gl.viewport(0, 0, RTT_WIDTH, tile.height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(shader.program);
        for (let i = 0; i < 16; i++) {
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, this.zerotex);
            gl.uniform1i(shader.textureLocations[i], 0);
        }
        var obj = {
            freeTexUnit: 4,
            zoom: 1. / this._zoom
        }
        styleExpr._preDraw(obj, gl);

        Object.keys(TID).forEach((name, i) => {
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[tile.propertyID[name]]);
            gl.uniform1i(shader.textureLocations[i], i);
        });

        gl.enableVertexAttribArray(shader.vertexAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuffer);
        gl.vertexAttribPointer(shader.vertexAttribute, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.disableVertexAttribArray(shader.vertexAttribute);
    }
    const tiles = this.tiles.filter(tile => tile.style);
    tiles.map(tile => styleTile(tile, tile.texColor, tile.style.colorShader, tile.style._color, tile.style.propertyColorTID));
    tiles.map(tile => styleTile(tile, tile.texWidth, tile.style.widthShader, tile.style._width, tile.style.propertyWidthTID));
    tiles.map(tile => styleTile(tile, tile.texStrokeColor, tile.style.strokeColorShader, tile.style._strokeColor, tile.style.propertyStrokeColorTID));
    tiles.map(tile => styleTile(tile, tile.texStrokeWidth, tile.style.strokeWidthShader, tile.style._strokeWidth, tile.style.propertyStrokeWidthTID));

    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    gl.useProgram(this.finalRendererProgram.program);
    var s = 1. / this._zoom;


    tiles.forEach(tile => {
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

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, tile.texStrokeColor);
        gl.uniform1i(this.finalRendererProgram.colorStrokeTexture, 2);

        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, tile.texStrokeWidth);
        gl.uniform1i(this.finalRendererProgram.strokeWidthTexture, 3);

        gl.drawArrays(gl.POINTS, 0, tile.numVertex);

        gl.disableVertexAttribArray(this.finalRendererProgram.vertexPositionAttribute);
        gl.disableVertexAttribArray(this.finalRendererProgram.featureIdAttr);
    });

    this.computePool.map(job => job.work(this));
    this.computePool = this.computePool.filter(j => j.status != 'dispatched');
    if (this.computePool.length > 0) {
        window.requestAnimationFrame(refresh.bind(this));
    }

    tiles.forEach(t => {
        if (t.style._color.isAnimated() || t.style._width.isAnimated()) {
            window.requestAnimationFrame(refresh.bind(this));
        }
    });

}

/**
 * Initialize static shaders
 */
Renderer.prototype._initShaders = function () {
    this.finalRendererProgram = shaders.renderer.createPointShader(this.gl);
}

Renderer.prototype.compute = function (type, expressions) {
    window.requestAnimationFrame(refresh.bind(this));
    const promise = new Promise((resolve, reject) => {
        this.computePool.push(new ComputeJob(type, expressions, resolve));
    });
    return promise;
}

function getFBstatus(gl) {
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    switch (status) {
        case gl.FRAMEBUFFER_COMPLETE:
            return 'FRAMEBUFFER_COMPLETE';
        case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            return 'FRAMEBUFFER_INCOMPLETE_ATTACHMENT';
        case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            return 'FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT';
        case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            return 'FRAMEBUFFER_INCOMPLETE_DIMENSIONS';
        case gl.FRAMEBUFFER_UNSUPPORTED:
            return 'FRAMEBUFFER_UNSUPPORTED';
        case gl.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE:
            return 'FRAMEBUFFER_INCOMPLETE_MULTISAMPLE';
        case gl.RENDERBUFFER_SAMPLES:
            return 'RENDERBUFFER_SAMPLES';
        default:
            return 'Unkown Framebuffer status';
    }
}

//TODO remove this hack :)
import * as shaders from './shaders';
import * as functions from './style/functions';

Renderer.prototype._compute = function (type, expressions) {
    const gl = this.gl;
    //Render to 1x1 FB

    let fb = this.fbPool.pop();
    if (!fb) {
        console.log("C FB")
        this.aux1x1FB = gl.createFramebuffer();
        fb = this.aux1x1FB;
        this.aux1x1TEX = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.aux1x1TEX);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
            1, 1, 0, gl.RGBA, gl.FLOAT,
            null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.aux1x1FB);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.aux1x1TEX, 0);
        //Check FB completeness
        if (getFBstatus(gl) != 'FRAMEBUFFER_COMPLETE') {
            //This is a very bad time to throw an exception, this code should never be executed,
            //all checks should be done earlier to avoid problems here
            //If this is still executed we'll warn and ignore
            console.warn(getFBstatus());
            return;
        }
    }
    this.aux1x1FB = fb;

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.aux1x1FB);

    gl.viewport(0, 0, 1, 1);

    if (type == 'sum') {
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.clearColor(0, 0, 0, 0);
    } else if (type == 'min') {
        gl.blendEquation(this.EXT_blend_minmax.MIN_EXT)
        gl.clearColor(Math.pow(2, 23), Math.pow(2, 23), Math.pow(2, 23), Math.pow(2, 23));
    } else {
        throw new Error("Invalid compute type");
    }



    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    //TODO disable DEPTH WRITE

    //TODO Render with shader => color = float(EXPRESSION)

    //Compile expression, use expression
    //const expr = new functions.HSV(1., 0, 0.12);
    let rgba = [0, 0, 0, 0].map(() => functions.float(0));
    expressions.map((e, i) => rgba[i] = e);
    const expr = functions.rgba(...rgba);
    /*functions.property('amount', {
        'amount': 'float'
    });*/
    const r = Style.compileShader(gl, expr, shaders.computer);
    const shader = r.shader;
    //console.log('computer', shader)

    gl.useProgram(shader.program);

    var s = 1. / this._zoom;
    var aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    //For each tile
    const tiles = this.tiles.filter(tile => tile.style);
    tiles.forEach(tile => {
        var obj = {
            freeTexUnit: 4
        }
        expr._preDraw(obj, gl);

        //TODO redundant code with refresh => refactor
        gl.uniform2f(shader.vertexScaleUniformLocation,
            (s / aspect) * tile.scale,
            s * tile.scale);
        gl.uniform2f(shader.vertexOffsetUniformLocation,
            (s / aspect) * (this._center.x - tile.center.x),
            s * (this._center.y - tile.center.y));

        gl.enableVertexAttribArray(shader.vertexPositionAttribute);
        gl.bindBuffer(gl.ARRAY_BUFFER, tile.vertexBuffer);
        gl.vertexAttribPointer(shader.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);


        gl.enableVertexAttribArray(shader.featureIdAttr);
        gl.bindBuffer(gl.ARRAY_BUFFER, tile.featureIDBuffer);
        gl.vertexAttribPointer(shader.featureIdAttr, 2, gl.FLOAT, false, 0, 0);

        Object.keys(r.tid).forEach((name, i) => {
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[tile.propertyID[name]]);
            gl.uniform1i(shader.textureLocations[i], i);
        });

        gl.drawArrays(gl.POINTS, 0, tile.numVertex);

        gl.disableVertexAttribArray(shader.vertexPositionAttribute);
        gl.disableVertexAttribArray(shader.featureIdAttr);

    });

    gl.blendEquation(gl.FUNC_ADD);

    //Readback!
    let pixels = new Float32Array(4);

    const readback = () => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, pixels);
        this.fbPool.push(fb);
        return Array.from(pixels);
    }
    return readback;
}