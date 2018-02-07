import { compileShader } from './shader-compiler';
import * as functions from './functions';
import * as shaders from '../shaders';
import * as schema from '../schema';

/**
 * @jsapi
 * @constructor
 * @description A Style defines how associated dataframes of a particular renderer should be renderer.
 *
 * Styles are only compatible with dataframes that comply with the same schema.
 * The schema is the interface that a dataframe must comply with.
 */
function Style(o) {
    o = o || {};
    this.updated = true;

    this._width = o.width || functions.float(5);
    this._width.parent = this;
    this._width.notify = () => {
        this._changed();
    };
    this._color = o.color || functions.rgba(0, 1, 0, 0.5);
    this._color.parent = this;
    this._color.notify = () => {
        this._changed();
    };
    this._strokeColor = o.strokeColor || functions.rgba(0, 1, 0, 0.5);
    this._strokeColor.parent = this;
    this._strokeColor.notify = () => {
        this._changed();
    };
    this._strokeWidth = o.strokeWidth || functions.float(0);
    this._strokeWidth.parent = this;
    this._strokeWidth.notify = () => {
        this._changed();
    };
    this._observer = null;
}

Style.prototype._changed = function () {
    if (this._observer) {
        this._observer();
    }
}
Style.prototype.onChange = function (callback) {
    this._observer = callback;
}

Style.prototype.getMinimumNeededSchema = function () {
    const exprs = [this._width, this._color, this._strokeColor, this._strokeWidth].filter(x => x && x._getMinimumNeededSchema);
    return exprs.map(expr => expr._getMinimumNeededSchema()).reduce(schema.union, schema.IDENTITY);
};

/*
Style.prototype.set = function (s, duration, meta) {
    s.color = s.color || functions.rgba(0.2, 0.2, 0.8, 0.5);
    s.width = s.width != undefined ? s.width : functions.float(4);
    s.strokeColor = s.strokeColor || functions.rgba(0, 0, 0, 0);
    s.strokeWidth = s.strokeWidth != undefined ? s.strokeWidth : functions.float(0);
    s.resolution = s.resolution == undefined ? 1 : s.resolution;

    this._width._bind(meta);
    this._color._bind(meta);
    this._strokeColor._bind(meta);
    this._strokeWidth._bind(meta);
    this.resolution = s.resolution;

    this.getWidth().blendTo(s.width, duration);
    this.getColor().blendTo(s.color, duration);
    this.getStrokeColor().blendTo(s.strokeColor, duration);
    this.getStrokeWidth().blendTo(s.strokeWidth, duration);
};*/

Style.prototype._compileColorShader = function (gl, metadata) {
    this._color._bind(metadata);
    const r = compileShader(gl, this._color, shaders.styler.createColorShader);
    this.propertyColorTID = r.tid;
    this.colorShader = r.shader;
};

Style.prototype._compileStrokeColorShader = function (gl, metadata) {
    this._strokeColor._bind(metadata);
    const r = compileShader(gl, this._strokeColor, shaders.styler.createColorShader);
    this.propertyStrokeColorTID = r.tid;
    this.strokeColorShader = r.shader;
};

Style.prototype._compileStrokeWidthShader = function (gl, metadata) {
    this._strokeWidth._bind(metadata);
    const r = compileShader(gl, this._strokeWidth, shaders.styler.createWidthShader);
    this.propertyStrokeWidthTID = r.tid;
    this.strokeWidthShader = r.shader;
};

Style.prototype._compileWidthShader = function (gl, metadata) {
    this._width._bind(metadata);
    const r = compileShader(gl, this._width, shaders.styler.createWidthShader);
    this.propertyWidthTID = r.tid;
    this.widthShader = r.shader;
};

Style.prototype._replaceChild = function (toReplace, replacer) {
    if (toReplace == this._color) {
        this._color = replacer;
        replacer.parent = this;
        replacer.notify = toReplace.notify;
    } else if (toReplace == this._width) {
        this._width = replacer;
        replacer.parent = this;
        replacer.notify = toReplace.notify;
    } else if (toReplace == this._strokeColor) {
        this._strokeColor = replacer;
        replacer.parent = this;
        replacer.notify = toReplace.notify;
    } else if (toReplace == this._strokeWidth) {
        this._strokeWidth = replacer;
        replacer.parent = this;
        replacer.notify = toReplace.notify;
    } else {
        throw new Error('No child found');
    }
};

import * as parser from './parser';
function parseStyle(str) {
    const o = parser.parseStyle(str);
    return new Style(o);
}

export {
    Style,
    compileShader,
    parseStyle
};
export * from './functions';
