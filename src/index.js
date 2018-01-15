import * as shaders from './shaders';
import * as Style from './style';
import * as schema from './schema';
import * as earcut from 'earcut';

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
    this.computePool = [];
    if (!this.gl) {
        this.gl = canvas.getContext('webgl');
        const gl = this.gl;
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

function getNormal(a, b) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    return normalize([-dy, dx]);
}

function normalize(v) {
    const s = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    return [v[0] / s, v[1] / s];
}
// Decode a tile geometry
// If the geometry type is 'point' it will pass trough the geom (the vertex array)
// If the geometry type is 'polygon' it will triangulate the polygon list (geom)
//      geom will be a list of polygons in which each polygon will have a flat array of vertices and a list of holes indices
//      Example:
/*         let geom = [
                {
                    flat: [
                        0.,0., 1.,0., 1.,1., 0.,1., 0.,0, //A square
                        0.25,0.25, 0.75,0.25, 0.75,0.75, 0.25,0.75, 0.25,0.25//A small square
                    ]
                    holes: [5]
                }
            ]
*/
// If the geometry type is 'line' it will generate the appropriate zero-sized, vertex-shader expanded triangle list with mitter joints.
// The geom will be an array of coordinates in this case
function decodeGeom(geomType, geom) {
    if (geomType == 'point') {
        return {
            geometry: geom,
            breakpointList: []
        };
    } else if (geomType == 'polygon') {
        let vertexArray = []; //Array of triangle vertices
        let breakpointList = []; // Array of indices (to vertexArray) that separate each feature
        geom.map(feature => {
            feature.map(polygon => {
                const triangles = earcut(polygon.flat, polygon.holes);
                const deviation = earcut.deviation(polygon.flat, polygon.holes, 2, triangles);
                if (deviation > 1) {
                    console.log('Earcut deviation:', deviation);
                }
                triangles.map(index => {
                    vertexArray.push(polygon.flat[2 * index]);
                    vertexArray.push(polygon.flat[2 * index + 1]);
                });
            });
            breakpointList.push(vertexArray.length);
        });
        return {
            geometry: new Float32Array(vertexArray),
            breakpointList
        };
    } else if (geomType == 'line') {
        let geometry = [];
        let normals = [];
        let breakpointList = []; // Array of indices (to vertexArray) that separate each feature
        geom.map(feature => {
            feature.map(line => {
                // Create triangulation
                for (let i = 0; i < line.length - 2; i += 2) {
                    const a = [line[i + 0], line[i + 1]];
                    const b = [line[i + 2], line[i + 3]];
                    if (i > 0) {
                        var prev = [line[i + -2], line[i + -1]];
                        var nprev = getNormal(a, prev);
                    }
                    if (i < line.length - 4) {
                        var next = [line[i + 4], line[i + 5]];
                        var nnext = getNormal(next, b);
                    }
                    //Compute normal
                    let normal = getNormal(b, a);
                    let na = normal;
                    let nb = normal;
                    //TODO bug, cartesian interpolation is not correct, should use polar coordinates for the interpolation
                    if (prev) {
                        na = normalize([
                            normal[0] * 0.5 + nprev[0] * 0.5,
                            normal[1] * 0.5 + nprev[1] * 0.5,
                        ]);
                    }
                    if (next) {
                        nb = normalize([
                            normal[0] * 0.5 + nnext[0] * 0.5,
                            normal[1] * 0.5 + nnext[1] * 0.5,
                        ]);
                    }
                    normals.push(-na[0], -na[1]);
                    normals.push(na[0], na[1]);
                    normals.push(-nb[0], -nb[1]);

                    normals.push(na[0], na[1]);
                    normals.push(nb[0], nb[1]);
                    normals.push(-nb[0], -nb[1]);

                    normal = [0, 0];


                    //First triangle
                    geometry.push(a[0] - 0.01 * normal[0]);
                    geometry.push(a[1] - 0.01 * normal[1]);

                    geometry.push(a[0] + 0.01 * normal[0]);
                    geometry.push(a[1] + 0.01 * normal[1]);

                    geometry.push(b[0] - 0.01 * normal[0]);
                    geometry.push(b[1] - 0.01 * normal[1]);

                    //Second triangle
                    geometry.push(a[0] + 0.01 * normal[0]);
                    geometry.push(a[1] + 0.01 * normal[1]);

                    geometry.push(b[0] + 0.01 * normal[0]);
                    geometry.push(b[1] + 0.01 * normal[1]);

                    geometry.push(b[0] - 0.01 * normal[0]);
                    geometry.push(b[1] - 0.01 * normal[1]);
                }
                //console.log("L", line, geometry)
            });
            breakpointList.push(geometry.length);
        });
        return {
            geometry: new Float32Array(geometry),
            breakpointList,
            normals: new Float32Array(normals)
        }
    } else {
        throw new Error(`Unimplemented geometry type: '${geomType}'`);
    }
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

    var points;
    const level = 0;
    const width = RTT_WIDTH;
    const decodedGeom = decodeGeom(dataframe.type, dataframe.geom);
    var points = decodedGeom.geometry;
    dataframe.numVertex = points.length / 2;
    dataframe.breakpointList = decodedGeom.breakpointList;

    dataframe.numFeatures = dataframe.breakpointList.length || dataframe.numVertex;
    const height = Math.ceil(dataframe.numFeatures / width);
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

    dataframe.texColor = this.createTileTexture('color', dataframe.numFeatures);
    dataframe.texWidth = this.createTileTexture('color', dataframe.numFeatures);
    dataframe.texStrokeColor = this.createTileTexture('color', dataframe.numFeatures);
    dataframe.texStrokeWidth = this.createTileTexture('color', dataframe.numFeatures);

    var ids = new Float32Array(points.length);
    let index = 0;
    for (var i = 0; i < points.length; i += 2) {
        if ((!dataframe.breakpointList.length && i > 0) || i == dataframe.breakpointList[index]) {
            index++;
        }
        ids[i + 0] = ((index) % width) / (width - 1);
        ids[i + 1] = height > 1 ? Math.floor((index) / width) / (height - 1) : 0.5;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, dataframe.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

    if (decodedGeom.normals) {
        dataframe.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, dataframe.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, decodedGeom.normals, gl.STATIC_DRAW);
    }

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
            sum += t.numFeatures;
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
Renderer.prototype.getStyledTiles = function () {
    return this.tiles.filter(tile => tile.style);
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

    var s = 1. / this._zoom;


    tiles.forEach(tile => {
        let renderer = null;
        if (tile.type == 'point') {
            renderer = this.finalRendererProgram;
        } else if (tile.type == 'line') {
            renderer = this.lineRendererProgram;
        } else {
            renderer = this.triRendererProgram;
        }
        gl.useProgram(renderer.program);
        gl.uniform2f(renderer.vertexScaleUniformLocation,
            (s / aspect) * tile.scale,
            s * tile.scale);
        gl.uniform2f(renderer.vertexOffsetUniformLocation,
            (s / aspect) * (this._center.x - tile.center.x),
            s * (this._center.y - tile.center.y));

        tile.vertexScale = [(s / aspect) * tile.scale,
        s * tile.scale];

        tile.vertexOffset = [(s / aspect) * (this._center.x - tile.center.x),
        s * (this._center.y - tile.center.y)];

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
        gl.bindTexture(gl.TEXTURE_2D, tile.texStrokeColor);
        gl.uniform1i(renderer.colorStrokeTexture, 2);

        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, tile.texStrokeWidth);
        gl.uniform1i(renderer.strokeWidthTexture, 3);

        gl.drawArrays(tile.type == 'point' ? gl.POINTS : gl.TRIANGLES, 0, tile.numVertex);

        gl.disableVertexAttribArray(renderer.vertexPositionAttribute);
        gl.disableVertexAttribArray(renderer.featureIdAttr);
        if (tile.type == 'line') {
            gl.disableVertexAttribArray(renderer.normalAttr);
        }
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
    this.triRendererProgram = shaders.renderer.createTriShader(this.gl);
    this.lineRendererProgram = shaders.renderer.createLineShader(this.gl);
}

Renderer.prototype.compute = function (type, expressions) {
    window.requestAnimationFrame(refresh.bind(this));
    const promise = new Promise((resolve, reject) => {
        this.computePool.push(new ComputeJob(type, expressions, resolve));
    });
    return promise;
}
