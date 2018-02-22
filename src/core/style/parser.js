
import jsep from 'jsep';
import * as functions from './functions';
import { implicitCast } from './expressions/utils';
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

function parseStyleNamedExpr(styleSpec, node) {
    if (node.operator != ':') {
        throw new Error('Invalid syntax');
    }
    const name = node.left.name;
    if (!name) {
        throw new Error('Invalid syntax');
    }
    const value = parseNode(node.right);
    // Don't cast resolution properties implicitly since they must be of type Number
    styleSpec[name] = name == 'resolution' ? value : implicitCast(value);
}

export function parseStyleDefinition(str) {
    // jsep addBinaryOp pollutes its module scope, we need to remove the custom operators afterwards
    jsep.addBinaryOp(':', 1);
    jsep.addBinaryOp('^', 10);
    const ast = jsep(str);
    let styleSpec = {};
    if (ast.type == 'Compound') {
        ast.body.map(node => parseStyleNamedExpr(styleSpec, node));
    } else {
        parseStyleNamedExpr(styleSpec, ast);
    }
    jsep.removeBinaryOp('^');
    jsep.removeBinaryOp(':');
    return styleSpec;
}

function parseFunctionCall(node) {
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
}

function parseBinaryOperation(node) {
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
}

function parseUnaryOperation(node) {
    switch (node.operator) {
    case '-':
        return functions.floatMul(-1, parseNode(node.argument));
    case '+':
        return parseNode(node.argument);
    default:
        throw new Error(`Invalid unary operator '${node.operator}'`);
    }
}

function parseIdentifier(node) {
    if (node.name[0] == '$') {
        return functions.property(node.name.substring(1));
    } else if (functions.palettes[node.name.toLowerCase()]) {
        return functions.palettes[node.name.toLowerCase()]();
    } else if (lowerCaseFunctions[node.name.toLowerCase()]) {
        return lowerCaseFunctions[node.name.toLowerCase()];
    }
}

function parseNode(node) {
    if (node.type == 'CallExpression') {
        return parseFunctionCall(node);
    } else if (node.type == 'Literal') {
        return node.value;
    } else if (node.type == 'ArrayExpression') {
        return node.elements.map(e => parseNode(e));
    } else if (node.type == 'BinaryExpression') {
        return parseBinaryOperation(node);
    } else if (node.type == 'UnaryExpression') {
        parseUnaryOperation(node);
    } else if (node.type == 'Identifier') {
        parseIdentifier(node);
    }
    throw new Error(`Invalid expression '${JSON.stringify(node)}'`);
}
