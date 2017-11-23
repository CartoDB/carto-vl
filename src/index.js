import * as shaders from './shaders';
import * as Style from './style';

// TODO remove
var gl;

// The maximum number of features per tile is RTT_WIDTH^2, large RTT_WIDTH values can be unsupported by the hardware,
// they imply a small waste of resources too
const RTT_WIDTH = 1024;

Renderer.prototype._initShaders = function () {
    this.finalRendererProgram = shaders.renderer.createPointShader(gl);
}

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

    if ((this.style._color.isAnimated() || this.style._width.isAnimated() || this.style.updated)) {
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

            gl.useProgram(this.style.colorShader.program);
            var obj = {
                freeTexUnit: 4
            }
            this.style._color._preDraw(obj);

            Object.keys(this.style.propertyColorTID).forEach((name, i) => {
                gl.activeTexture(gl.TEXTURE0 + i);
                gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[tile.propertyID[name]]);
                gl.uniform1i(this.style.colorShader.textureLocations[i], i);
            });

            gl.enableVertexAttribArray(this.colorShaderVertex);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuffer);
            gl.vertexAttribPointer(this.style.colorShader.vertexAttribute, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLES, 0, 3);
        });

        //WIDTH
        this.tiles.forEach(tile => {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tile.texWidth, 0);
            gl.useProgram(this.style.widthShader.program);
            gl.viewport(0, 0, RTT_WIDTH, tile.height);
            gl.clear(gl.COLOR_BUFFER_BIT);
            var obj = {
                freeTexUnit: 4
            }
            this.style._width._preDraw(obj);
            Object.keys(this.style.propertyWidthTID).forEach((name, i) => {
                gl.activeTexture(gl.TEXTURE0 + i);
                gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[tile.propertyID[name]]);
                gl.uniform1i(this.style.widthShader.textureLocations[i], i);
            });

            gl.enableVertexAttribArray(this.style.widthShader.vertexAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuffer);
            gl.vertexAttribPointer(this.style.widthShader.vertexAttribute, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLES, 0, 3);

            this.style.updated = false;
            tile.initialized = true;
        });

    }

    gl.enable(gl.DEPTH_TEST);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
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

    if (this.style._color.isAnimated() || this.style._width.isAnimated()) {
        window.requestAnimationFrame(refresh.bind(this));
    }
}

Renderer.prototype.removeTile = function (tile) {
    this.tiles = this.tiles.filter(t => t !== tile);
    tile.propertyTex.map(tex => gl.deleteTexture(tex));
    gl.deleteTexture(tile.texColor);
    gl.deleteTexture(tile.texWidth);
    gl.deleteBuffer(tile.vertexBuffer);
    gl.deleteBuffer(tile.featureIDBuffer);
}

Renderer.prototype.addTile = function (tile) {
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
}

function Renderer(canvas) {
    this.canvas = canvas;
    this.tiles = [];
    if (!gl) {
        gl = canvas.getContext('webgl');
        Style.setGL(gl);
        var ext = gl.getExtension("OES_texture_float");
        if (!ext) {
            console.error("this machine or browser does not support OES_texture_float");
        }
        if (!gl) {
            console.warn('Unable to initialize WebGL2. Your browser may not support it.');
            return null
        }
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

Renderer.prototype.getCenter = function () {
    return { x: this._center.x, y: this._center.y };
}
Renderer.prototype.setCenter = function (x, y) {
    this._center.x = x;
    this._center.y = y;
    window.requestAnimationFrame(refresh.bind(this));
}

Renderer.prototype.getZoom = function () {
    return this._zoom;
}
Renderer.prototype.setZoom = function (zoom) {
    this._zoom = zoom;
    window.requestAnimationFrame(refresh.bind(this));
}

export { Renderer, Style };