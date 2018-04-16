
import jsep from 'jsep';
import * as functions from './functions';
import { implicitCast } from './expressions/utils';
import { CSS_COLOR_NAMES, NamedColor } from './expressions/named-color';

// TODO use Schema classes

const aggFns = [];

var lowerCaseFunctions = {};
Object.keys(functions)
    .filter(name => name[0] == name[0].toLowerCase()) // Only get functions starting with lowercase
    .map(name => { lowerCaseFunctions[name.toLocaleLowerCase()] = functions[name]; });
lowerCaseFunctions.true = functions.TRUE;
lowerCaseFunctions.false = functions.FALSE;

export function parseVizExpression(str) {
    prepareJsep();
    const r = implicitCast(parseNode(jsep(str)));
    cleanJsep();
    return r;
}

export function parseVizDefinition(str) {
    prepareJsep();
    const ast = jsep(str);
    let styleSpec = { variables: {} };
    if (ast.type == 'Compound') {
        ast.body.map(node => parseVizNamedExpr(styleSpec, node));
    } else {
        parseVizNamedExpr(styleSpec, ast);
    }
    cleanJsep();
    return styleSpec;
}

function parseVizNamedExpr(styleSpec, node) {
    if (node.operator != ':') {
        throw new Error('Invalid syntax');
    }
    if (node.left.name.length && node.left.name[0] == '@') {
        node.left.name = '__cartovl_variable_' + node.left.name.substr(1);
    }
    const name = node.left.name;
    if (!name) {
        throw new Error('Invalid syntax');
    }
    if (name.startsWith('__cartovl_variable_')) {
        styleSpec.variables[node.left.name.substr('__cartovl_variable_'.length)] = implicitCast(parseNode(node.right));
    } else if (name == 'resolution') {
        const value = parseNode(node.right);
        styleSpec[name] = value;
    } else {
        const value = parseNode(node.right);
        styleSpec[name] = implicitCast(value);
    }

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
        case '>':
            return functions.greaterThan(left, right);
        case '>=':
            return functions.greaterThanOrEqualTo(left, right);
        case '<':
            return functions.lessThan(left, right);
        case '<=':
            return functions.lessThanOrEqualTo(left, right);
        case '==':
            return functions.equals(left, right);
        case 'and':
            return functions.and(left, right);
        case 'or':
            return functions.or(left, right);
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
    if (node.name.length && node.name[0] == '@') {
        node.name = '__cartovl_variable_' + node.name.substr(1);
    }
    if (node.name.startsWith('__cartovl_variable_')) {
        return functions.variable(node.name.substr('__cartovl_variable_'.length));
    } else if (node.name[0] == '$') {
        return functions.property(node.name.substring(1));
    } else if (functions.palettes[node.name.toLowerCase()]) {
        return functions.palettes[node.name.toLowerCase()];
    } else if (lowerCaseFunctions[node.name.toLowerCase()]) {
        return lowerCaseFunctions[node.name.toLowerCase()];
    } else if (CSS_COLOR_NAMES.includes(node.name.toLowerCase())) {
        return new NamedColor(node.name.toLowerCase());
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
        return parseUnaryOperation(node);
    } else if (node.type == 'Identifier') {
        return parseIdentifier(node);
    }
    throw new Error(`Invalid expression '${JSON.stringify(node)}'`);
}

function prepareJsep() {
    // jsep addBinaryOp pollutes its module scope, we need to remove the custom operators afterwards
    jsep.addBinaryOp(':', 0);
    jsep.addBinaryOp('^', 11);
    jsep.addBinaryOp('or', 1);
    jsep.addBinaryOp('and', 2);
    jsep.addIdentifierChar('@');
    jsep.removeLiteral('true');
    jsep.removeLiteral('false');
}

function cleanJsep() {
    jsep.removeBinaryOp('and');
    jsep.removeBinaryOp('or');
    jsep.removeBinaryOp('^');
    jsep.removeBinaryOp(':');
    jsep.removeIdentifierChar('@');
    jsep.addLiteral('true');
    jsep.addLiteral('false');
}
