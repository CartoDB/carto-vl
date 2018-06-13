
import jsep from 'jsep';
import * as functions from './functions';
import { implicitCast } from './expressions/utils';
import { CSS_COLOR_NAMES, NamedColor } from './expressions/color/NamedColor';
import Hex from './expressions/color/hex';

// TODO use Schema classes

const aggFns = [];

var lowerCaseFunctions = {};
Object.keys(functions)
    .filter(name => name[0] == name[0].toLowerCase()) // Only get functions starting with lowercase
    .map(name => { lowerCaseFunctions[name.toLocaleLowerCase()] = functions[name]; });
lowerCaseFunctions.true = functions.TRUE;
lowerCaseFunctions.false = functions.FALSE;
lowerCaseFunctions.align_center = functions.ALIGN_CENTER;
lowerCaseFunctions.align_bottom = functions.ALIGN_BOTTOM;
lowerCaseFunctions.pi = functions.PI;
lowerCaseFunctions.e = functions.E;

export function parseVizExpression(str) {
    prepareJsep();
    const r = implicitCast(parseNode(jsep(str)));
    cleanJsep();
    return r;
}

export function parseVizDefinition(str) {
    prepareJsep();
    const ast = jsep(cleanComments(str));
    let vizSpec = { variables: {} };
    if (ast.type == 'Compound') {
        ast.body.map(node => parseVizNamedExpr(vizSpec, node));
    } else {
        parseVizNamedExpr(vizSpec, ast);
    }
    cleanJsep();
    return vizSpec;
}

function parseVizNamedExpr(vizSpec, node) {
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
        vizSpec.variables[node.left.name.substr('__cartovl_variable_'.length)] = implicitCast(parseNode(node.right));
    } else if (name == 'resolution') {
        const value = parseNode(node.right);
        vizSpec[name] = value;
    } else {
        const value = parseNode(node.right);
        vizSpec[name] = implicitCast(value);
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
            return functions.mul(left, right);
        case '/':
            return functions.div(left, right);
        case '+':
            return functions.add(left, right);
        case '-':
            return functions.sub(left, right);
        case '%':
            return functions.mod(left, right);
        case '^':
            return functions.pow(left, right);
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
        case '!=':
            return functions.notEquals(left, right);
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
            return functions.mul(-1, parseNode(node.argument));
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
    } else if (node.name[0] == '#') {
        return new Hex(node.name);
    } else if (node.name[0] == '$') {
        return functions.property(node.name.substring(1));
    } else if (functions.palettes[node.name.toUpperCase()]) {
        return functions.palettes[node.name.toUpperCase()];
    } else if (lowerCaseFunctions[node.name.toLowerCase()]) {
        return lowerCaseFunctions[node.name.toLowerCase()];
    } else if (CSS_COLOR_NAMES.includes(node.name.toLowerCase())) {
        return new NamedColor(node.name.toLowerCase());
    } else {
        throw new Error(`Invalid expression '${JSON.stringify(node)}'`);
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
    jsep.addIdentifierChar('#');
    jsep.removeLiteral('true');
    jsep.removeLiteral('false');
}

function cleanJsep() {
    jsep.removeBinaryOp('and');
    jsep.removeBinaryOp('or');
    jsep.removeBinaryOp('^');
    jsep.removeBinaryOp(':');
    jsep.removeIdentifierChar('@');
    jsep.removeIdentifierChar('#');
    jsep.addLiteral('true');
    jsep.addLiteral('false');
}

/**
 * Remove comments from string
 * - // line comments
 * - /* block comments
 * - Keep comments inside single and double quotes tracking escape chars
 * Based on: https://j11y.io/javascript/removing-comments-in-javascript/
 */
export function cleanComments(str) {
    var mode = {
        singleQuote: false,
        doubleQuote: false,
        blockComment: false,
        lineComment: false,
        escape: 0
    };

    // Adding chars to avoid index checking
    str = ('_' + str + '_').split('');

    for (var i = 0, l = str.length; i < l; i++) {

        if (mode.singleQuote) {
            if (str[i] == '\\') {
                mode.escape++;
            } else if (str[i] === '\'' && mode.escape % 2 == 0) {
                mode.singleQuote = false;
                mode.escape = 0;
            }
            continue;
        }

        if (mode.doubleQuote) {
            if (str[i] == '\\') {
                mode.escape++;
            } else if (str[i] === '"' && mode.escape % 2 == 0) {
                mode.doubleQuote = false;
                mode.escape = 0;
            }
            continue;
        }

        if (mode.blockComment) {
            if (str[i] === '*' && str[i + 1] === '/') {
                str[i + 1] = '';
                mode.blockComment = false;
            }
            str[i] = '';
            continue;
        }

        if (mode.lineComment) {
            if (str[i + 1] === '\n' || str[i + 1] === '\r') {
                mode.lineComment = false;
            }
            if (i + 1 < l) {
                str[i] = '';
            }
            continue;
        }

        mode.doubleQuote = str[i] === '"';
        mode.singleQuote = str[i] === '\'';

        if (str[i] === '/') {

            if (str[i + 1] === '*') {
                str[i] = '';
                mode.blockComment = true;
                continue;
            }
            if (str[i + 1] === '/') {
                str[i] = '';
                mode.lineComment = true;
                continue;
            }
        }
    }

    // Remove chars added before
    return str.join('').slice(1, -1);
}
