var gl = null;

import jsep from 'jsep';
import * as functions from './functions';
import parseStyle from './parser';

export {
    Style,
    setGL,
};
export * from './functions';
export {default as parseStyle} from './parser';

function setGL(_gl) {
    gl = _gl;
    functions.setGL(gl);
}

function Style(layer) {
    this.layer = layer;
    this.updated = true;

    this._width = functions.Float(3);
    this._width.parent = this;
    this._width.notify = () => {
        this.layer._compileWidthShader();
        window.requestAnimationFrame(this.layer.renderer.refresh.bind(this.layer.renderer));
    };
    this._color = functions.Color([0, 1, 0, 1]);
    this._color.parent = this;
    this._color.notify = () => {
        this.layer._compileColorShader();
        window.requestAnimationFrame(this.layer.renderer.refresh.bind(this.layer.renderer));
    };
}
Style.prototype.setWidth = function (float) {
    this._width = float;
    this.updated = true;
    float.parent = this;
    float.notify = () => {
        this.layer._compileWidthShader();
        window.requestAnimationFrame(this.layer.renderer.refresh.bind(this.layer.renderer));
    };
    float.notify();
}
Style.prototype.replaceChild = function (toReplace, replacer) {
    if (toReplace == this._color) {
        this._color = replacer;
        replacer.parent = this;
        replacer.notify = toReplace.notify;
    } else if (toReplace == this._width) {
        this._width = replacer;
        replacer.parent = this;
        replacer.notify = toReplace.notify;
    } else {
        console.warn('No child found');
    }
}

Style.prototype.setColor = function (color) {
    this._color = color;
    this.updated = true;
    color.parent = this;
    color.notify = () => {
        this.layer._compileColorShader();
        window.requestAnimationFrame(this.layer.renderer.refresh.bind(this.layer.renderer));
    };
    color.notify();
}
Style.prototype.getWidth = function () {
    return this._width;
}
Style.prototype.getColor = function () {
    return this._color;
}