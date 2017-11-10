var gl;

const RTT_WIDTH = 1024;

const shader = require("./shader");
var style = require("./style");

Renderer.prototype._initShaders = function () {
    this.finalRendererProgram = shader.renderer.createPointShader(gl);
}
function compileShader( sourceCode, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error('An error occurred compiling the shaders: ' + log + '\nSource:\n' + sourceCode);
    }
    return shader;
}
Layer.prototype._compileColorShader = function () {
    var VS = compileShader(shader.styler.color.VS, gl.VERTEX_SHADER);
    var uniformIDcounter = 0;
    var tid = {};
    const colorModifier = this.style._color._applyToShaderSource(() => uniformIDcounter++, name => {
        if (tid[name] !== undefined) {
            return tid[name];
        }
        tid[name] = Object.keys(tid).length;
        return tid[name];
    });
    //TODO check tid table size
    this.propertyColorTID = tid;
    var source = shader.styler.color.FS;
    source = source.replace('$PREFACE', colorModifier.preface);
    source = source.replace('$COLOR', colorModifier.inline);
    console.log("Recompile color", source);
    var FS = compileShader(source, gl.FRAGMENT_SHADER);
    if (this.colorShader) {
        gl.deleteProgram(this.colorShader);
    }
    this.colorShader = gl.createProgram();
    gl.attachShader(this.colorShader, VS);
    gl.attachShader(this.colorShader, FS);
    gl.linkProgram(this.colorShader);
    if (!gl.getProgramParameter(this.colorShader, gl.LINK_STATUS)) {
        console.warn('Unable to initialize the shader program: ' + gl.getProgramInfoLog(this.colorShader));
    }
    this.style._color._postShaderCompile(this.colorShader);
    this.colorShaderVertex = gl.getAttribLocation(this.colorShader, 'vertex');
    this.colorShaderTex = [];
    for (var i = 0; i < 8; i++) {
        this.colorShaderTex[i] = gl.getUniformLocation(this.colorShader, `property${i}`);
    }
    gl.deleteShader(VS);
    gl.deleteShader(FS);
}

Layer.prototype._compileWidthShader = function () {
    var VS = compileShader(shader.styler.width.VS, gl.VERTEX_SHADER);
    var uniformIDcounter = 0;
    var tid = {};
    const widthModifier = this.style._width._applyToShaderSource(() => uniformIDcounter++, name => {
        if (tid[name] !== undefined) {
            return tid[name];
        }
        tid[name] = Object.keys(tid).length;
        return tid[name];
    });
    //TODO check tid table size
    this.propertyWidthTID = tid;
    var source = shader.styler.width.FS;
    source = source.replace('$PREFACE', widthModifier.preface);
    source = source.replace('$WIDTH', widthModifier.inline);
    console.log("Recompile width", source)
    var FS = compileShader(source, gl.FRAGMENT_SHADER);
    if (this.widthShader) {
        gl.deleteProgram(this.widthShader);
    }
    this.widthShader = gl.createProgram();
    gl.attachShader(this.widthShader, VS);
    gl.attachShader(this.widthShader, FS);
    gl.linkProgram(this.widthShader);
    if (!gl.getProgramParameter(this.widthShader, gl.LINK_STATUS)) {
        console.warn('Unable to initialize the shader program: ' + gl.getProgramInfoLog(this.widthShader));
    }
    this.style._width._postShaderCompile(this.widthShader);
    this.widthShaderVertex = gl.getAttribLocation(this.widthShader, 'vertex');
    this.widthShaderTex = [];
    for (var i = 0; i < 8; i++) {
        this.widthShaderTex[i] = gl.getUniformLocation(this.widthShader, `property${i}`);
    }
    gl.deleteShader(VS);
    gl.deleteShader(FS);
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

    this.layers.forEach(layer => {
        if ((layer.style._color.isAnimated() || layer.style._width.isAnimated() || layer.style.updated)) {
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
            layer.tiles.forEach(tile => {
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tile.texColor, 0);
                gl.viewport(0, 0, RTT_WIDTH, tile.height);
                gl.clear(gl.COLOR_BUFFER_BIT);

                gl.useProgram(layer.colorShader);

                layer.style._color._preDraw(layer);

                Object.keys(layer.propertyColorTID).forEach((name, i) => {
                    gl.activeTexture(gl.TEXTURE0 + i);
                    gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[layer.propertyID[name]]);
                    gl.uniform1i(layer.colorShaderTex[i], i);
                });

                gl.enableVertexAttribArray(this.colorShaderVertex);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuffer);
                gl.vertexAttribPointer(layer.colorShaderVertex, 2, gl.FLOAT, false, 0, 0);

                gl.drawArrays(gl.TRIANGLES, 0, 3);
            });

            //WIDTH
            layer.tiles.forEach(tile => {
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tile.texWidth, 0);
                gl.useProgram(layer.widthShader);
                gl.viewport(0, 0, RTT_WIDTH, tile.height);
                gl.clear(gl.COLOR_BUFFER_BIT);

                layer.style._width._preDraw(layer);
                Object.keys(layer.propertyWidthTID).forEach((name, i) => {
                    gl.activeTexture(gl.TEXTURE0 + i);
                    gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[layer.propertyID[name]]);
                    gl.uniform1i(layer.widthShaderTex[i], i);
                });

                gl.enableVertexAttribArray(layer.widthShaderVertex);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuffer);
                gl.vertexAttribPointer(layer.widthShaderVertex, 2, gl.FLOAT, false, 0, 0);

                gl.drawArrays(gl.TRIANGLES, 0, 3);

                layer.style.updated = false;
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


        layer.tiles.forEach(tile => {
            gl.uniform2f(this.finalRendererProgram.vertexScaleUniformLocation, s / aspect * tile.scale, s * tile.scale);
            gl.uniform2f(this.finalRendererProgram.vertexOffsetUniformLocation, s / aspect * this._center.x + tile.center.x, s * this._center.y + tile.center.y);

            gl.enableVertexAttribArray(this.finalRendererProgram.vertexPositionAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, tile.vertexBuffer);
            gl.vertexAttribPointer(this.finalRendererProgram.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);


            gl.enableVertexAttribArray(this.finalRendererProgram.FeatureIdAttr);
            gl.bindBuffer(gl.ARRAY_BUFFER, tile.featureIDBuffer);
            gl.vertexAttribPointer(this.finalRendererProgram.FeatureIdAttr, 2, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, tile.texColor);
            gl.uniform1i(this.finalRendererProgram.rendererColorTex, 0);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, tile.texWidth);
            gl.uniform1i(this.finalRendererProgram.rendererWidthTex, 1);

            gl.drawArrays(gl.POINTS, 0, tile.numVertex);

        });

        if (layer.style._color.isAnimated() || layer.style._width.isAnimated()) {
            window.requestAnimationFrame(refresh.bind(this));
        }
    });
}



function Layer(renderer, geometryType) {
    this.renderer = renderer;
    this.geometryType = geometryType;
    this.style = new style.Style(this);
    this.tiles = [];
    this._compileColorShader();
    this._compileWidthShader();
    this.propertyCount = 0;
    this.propertyID = {}; //Name => PID
    this.propertyWidthTID = {}; //Name => Texture image unit ID
    this.propertyColorTID = {}; //Name => Texture image unit ID
    this.categoryMap = {};
}


Layer.prototype.removeTile = function (tile) {
    this.tiles = this.tiles.filter(t => t !== tile);
    tile.propertyTex.map(tex => gl.deleteTexture(tex));
    gl.deleteTexture(tile.texColor);
    gl.deleteTexture(tile.texWidth);
    gl.deleteBuffer(tile.vertexBuffer);
    gl.deleteBuffer(tile.featureIDBuffer);
}

//TODO => setTileProperty (or geom)

Layer.prototype.addTile = function (tile) {
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


    for (var k in tile.properties) {
        if (tile.properties.hasOwnProperty(k) && tile.properties[k].length > 0) {
            const isCategory = !Number.isFinite(tile.properties[k][0]);
            const property = tile.properties[k];
            var propertyID = this.propertyID[k];
            if (propertyID === undefined) {
                propertyID = this.propertyCount;
                this.propertyCount++;
                this.propertyID[k] = propertyID;
            }
            tile.propertyTex[propertyID] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tile.propertyTex[propertyID]);
            const pixel = new Float32Array(width * height);
            for (var i = 0; i < property.length; i++) {
                pixel[i] = property[i];
            }
            if (isCategory) {
                var map = this.categoryMap[k];
                if (!map) {
                    map = {};
                    this.categoryMap[k] = map;
                }
                for (var i = 0; i < property.length; i++) {
                    var catID = map[property[i]];
                    if (catID === undefined) {
                        map[property[i]] = Object.keys(map).length;
                        catID = map[property[i]];
                    }
                    pixel[i] = catID / 256.;
                }
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

    window.requestAnimationFrame(refresh.bind(this.renderer));

    return tile;
}

function Renderer(canvas) {
    this.canvas = canvas;
    if (!gl) {
        gl = canvas.getContext('webgl');
        style.setGL(gl);
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
    this.layers = [];
    this.squareBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.squareBuffer);
    var vertices = [
        10.0, -10.0,
        0.0, 10.0,
        -10.0, -10.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

Renderer.prototype.addLayer = function () {
    var layer = new Layer(this, 'points');
    this.layers.push(layer);
    return layer;
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

module.exports = {
    Renderer: Renderer,
    Style: style
};