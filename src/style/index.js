var gl = null;

import jsep from 'jsep';
import * as functions from './functions';

export {
    parseStyle,
    Style,
    setGL,
};
export * from './functions';


function setGL(_gl) {
    gl = _gl;
    functions.setGL(gl);
}



function parseNode(node) {
    if (node.type == 'CallExpression') {
        const args = node.arguments.map(arg => parseNode(arg));
        switch (node.callee.name) {
            case 'RampColor':
                return functions.RampColor(...args);
            case 'Near':
                return functions.Near(...args);
            case 'Now':
                return functions.Now(...args);
            default:
                break;
        }
    } else if (node.type == 'Literal') {
        return node.value;
    } else if (node.type == 'ArrayExpression') {
        return node.elements.map(e => parseNode(e));
    } else if (node.type == 'BinaryExpression') {
        const left = parseNode(node.left);
        const right = parseNode(node.right);
        switch (node.operator) {
            case "*":
                //TODO check left & right types => float
                return functions.FloatMul(left, right);
            case "/":
                return functions.FloatDiv(left, right);
            case "+":
                return functions.FloatAdd(left, right);
            case "-":
                return functions.FloatSub(left, right);
            case "^":
                return functions.FloatPow(left, right);
            default:
                break;
        }
    }
    console.warn(node);
    return null;
}

jsep.addBinaryOp("^", 10);
function parseStyle(str) {
    const tree = jsep(str);
    console.log(tree)
    const e = parseNode(tree);
    console.log(e)
    return e;
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