
import jsep from 'jsep';
import * as functions from './functions';
import { schema } from '../renderer';
import {implicitCast} from './expressions/utils';
// TODO use Schema classes

const aggFns = [];

var lowerCaseFunctions = {};
Object.keys(functions).filter(
    name => name[0] == name[0].toLowerCase()
).map(name => {
    lowerCaseFunctions[name.toLocaleLowerCase()] = functions[name];
});

/**
 * @jsapi
 * @param {*} str
 * @param {*} schema
 */
export function parseStyleExpression(str, schema) {
    // jsep addBinaryOp pollutes its module scope, we need to remove the custom operators afterwards
    jsep.addBinaryOp('^', 10);
    const r = parseNode(jsep(str), schema);
    jsep.removeBinaryOp('^');
    return r;
}

function parseStyleNamedExpr(style, node) {
    if (node.operator != ':') {
        throw new Error('Invalid syntax');
    }
    const name = node.left.name;
    if (!name) {
        throw new Error('Invalid syntax');
    }
    const value = parseNode(node.right);
    style[name] = implicitCast(value);
}

class Style {
    constructor() {
    }
    getMinimumNeededSchema() {
        const exprs = [this.width, this.color, this.strokeColor, this.strokeWidth].filter(x => x && x._getMinimumNeededSchema);
        return exprs.map(expr => expr._getMinimumNeededSchema()).reduce(schema.union, schema.IDENTITY);
    }
}

export function parseStyle(str) {
    // jsep addBinaryOp pollutes its module scope, we need to remove the custom operators afterwards
    jsep.addBinaryOp(':', 1);
    jsep.addBinaryOp('^', 10);
    const ast = jsep(str);
    let style = new Style();
    if (ast.type == 'Compound') {
        ast.body.map(node => parseStyleNamedExpr(style, node));
    } else {
        parseStyleNamedExpr(style, ast);
    }
    jsep.removeBinaryOp('^');
    jsep.removeBinaryOp(':');
    return style;
}

function parseNode(node) {
    if (node.type == 'CallExpression') {
        const name = node.callee.name.toLowerCase();
        if (aggFns.includes(name)) {
            //node.arguments[0].name += '_' + name;
            const args = node.arguments.map(arg => parseNode(arg));
            return args[0];
        }
        const args = node.arguments.map(arg => parseNode(arg));
        if (lowerCaseFunctions[name]) {
            return lowerCaseFunctions[name](...args);
        }
        throw new Error(`Invalid function name '${node.callee.name}'`);
    } else if (node.type == 'Literal') {
        return node.value;
    } else if (node.type == 'ArrayExpression') {
        return node.elements.map(e => parseNode(e));
    } else if (node.type == 'BinaryExpression') {
        const left = parseNode(node.left);
        const right = parseNode(node.right);
        switch (node.operator) {
        case '*':
            return functions.floatMul(left, right);
        case '/':
            return functions.floatDiv(left, right);
        case '+':
            return functions.floatAdd(left, right);
        case '-':
            return functions.floatSub(left, right);
        case '%':
            return functions.floatMod(left, right);
        case '^':
            return functions.floatPow(left, right);
        default:
            throw new Error(`Invalid binary operator '${node.operator}'`);
        }
    } else if (node.type == 'UnaryExpression') {
        switch (node.operator) {
        case '-':
            return functions.floatMul(-1, parseNode(node.argument));
        case '+':
            return parseNode(node.argument);
        default:
            throw new Error(`Invalid unary operator '${node.operator}'`);
        }
    } else if (node.type == 'Identifier') {
        if (node.name[0] == '$') {
            return functions.property(node.name.substring(1));
        } else if (functions.palettes[node.name.toLowerCase()]) {
            return functions.palettes[node.name.toLowerCase()];
        } else if (lowerCaseFunctions[node.name.toLowerCase()]) {
            return lowerCaseFunctions[node.name.toLowerCase()];
        }
    }
    throw new Error(`Invalid expression '${JSON.stringify(node)}'`);
}
