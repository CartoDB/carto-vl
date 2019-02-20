
import jsep from 'jsep';
import * as expressions from './expressions';
import { implicitCast } from './expressions/utils';
import { CSS_COLOR_NAMES } from './expressions/color/cssColorNames';
import NamedColor from './expressions/color/NamedColor';
import Hex from './expressions/color/hex';
import Base from './expressions/base';
import CartoParsingError from '../../errors/carto-parsing-error';

// TODO use Schema classes

const aggFns = [];

const lowerCaseExpressions = {};
Object.keys(expressions)
    .filter(name => name[0] === name[0].toLowerCase()) // Only get expressions starting with lowercase
    .map(name => { lowerCaseExpressions[name.toLocaleLowerCase()] = expressions[name]; });

lowerCaseExpressions.true = expressions.TRUE;
lowerCaseExpressions.false = expressions.FALSE;
lowerCaseExpressions.align_center = expressions.ALIGN_CENTER;
lowerCaseExpressions.align_bottom = expressions.ALIGN_BOTTOM;

lowerCaseExpressions.pi = expressions.PI;
lowerCaseExpressions.e = expressions.E;
lowerCaseExpressions.hold = expressions.HOLD;

lowerCaseExpressions.bicycle = expressions.BICYCLE;
lowerCaseExpressions.building = expressions.BUILDING;
lowerCaseExpressions.bus = expressions.BUS;
lowerCaseExpressions.car = expressions.CAR;
lowerCaseExpressions.circle = expressions.CIRCLE;
lowerCaseExpressions.circle_outline = expressions.CIRCLE_OUTLINE;
lowerCaseExpressions.cross = expressions.CROSS;
lowerCaseExpressions.flag = expressions.FLAG;
lowerCaseExpressions.house = expressions.HOUSE;
lowerCaseExpressions.marker = expressions.MARKER;
lowerCaseExpressions.marker_outline = expressions.MARKER_OUTLINE;
lowerCaseExpressions.plus = expressions.PLUS;
lowerCaseExpressions.square = expressions.SQUARE;
lowerCaseExpressions.square_outline = expressions.SQUARE_OUTLINE;
lowerCaseExpressions.star = expressions.STAR;
lowerCaseExpressions.star_outline = expressions.STAR_OUTLINE;
lowerCaseExpressions.triangle = expressions.TRIANGLE;
lowerCaseExpressions.triangle_outline = expressions.TRIANGLE_OUTLINE;

const originalBaseBlendTo = Base.prototype.blendTo;
Base.prototype.blendTo = function (final, ...args) {
    if (typeof final === 'string') {
        final = parseVizExpression(final);
    }
    return originalBaseBlendTo.bind(this)(final, ...args);
};

export function parseVizExpression (str) {
    prepareJsep();
    const r = implicitCast(parseNode(jsep(str)));
    cleanJsep();
    return r;
}

export function parseVizDefinition (str) {
    prepareJsep();
    const ast = jsep(cleanComments(str));
    let vizSpec = { variables: {} };
    if (ast.type === 'Compound') {
        ast.body.map(node => parseVizNamedExpr(vizSpec, node));
    } else {
        parseVizNamedExpr(vizSpec, ast);
    }
    cleanJsep();
    return vizSpec;
}

function parseVizNamedExpr (vizSpec, node) {
    if (node.operator !== ':') {
        throw new CartoParsingError('Invalid syntax.');
    }

    if (node.left.name.length && node.left.name[0] === '@') {
        node.left.name = '__cartovl_variable_' + node.left.name.substr(1);
    }

    let name = node.left.name;

    if (!name) {
        throw new CartoParsingError('Invalid syntax.');
    }

    if (name.startsWith('__cartovl_variable_')) {
        name = node.left.name.substr('__cartovl_variable_'.length);
        if (name in vizSpec.variables) {
            throw new CartoParsingError(`Variable '${name}' is already defined.`);
        }

        vizSpec.variables[name] = implicitCast(parseNode(node.right));
    } else {
        if (name in vizSpec) {
            throw new CartoParsingError(`Property '${name}' is already defined.`);
        }
        const value = parseNode(node.right);
        vizSpec[name] = (name === 'resolution') ? value : implicitCast(value);
    }
}

function parseFunctionCall (node) {
    const name = node.callee.name.toLowerCase();
    if (aggFns.includes(name)) {
        // node.arguments[0].name += '_' + name;
        const args = node.arguments.map(arg => parseNode(arg));
        return args[0];
    }
    const args = node.arguments.map(arg => parseNode(arg));
    if (lowerCaseExpressions[name]) {
        return lowerCaseExpressions[name](...args);
    }
    throw new CartoParsingError(`Invalid function name '${node.callee.name}'.`);
}

function parseBinaryOperation (node) {
    const left = parseNode(node.left);
    const right = parseNode(node.right);
    switch (node.operator.toLowerCase()) {
        case '*':
            return expressions.mul(left, right);
        case '/':
            return expressions.div(left, right);
        case '+':
            return expressions.add(left, right);
        case '-':
            return expressions.sub(left, right);
        case '%':
            return expressions.mod(left, right);
        case '^':
            return expressions.pow(left, right);
        case '>':
            return expressions.greaterThan(left, right);
        case '>=':
            return expressions.greaterThanOrEqualTo(left, right);
        case '<':
            return expressions.lessThan(left, right);
        case '<=':
            return expressions.lessThanOrEqualTo(left, right);
        case '==':
            return expressions.equals(left, right);
        case '!=':
            return expressions.notEquals(left, right);
        case 'and':
            return expressions.and(left, right);
        case 'or':
            return expressions.or(left, right);
        case 'in':
            return expressions.in(left, right);
        case 'nin':
            return expressions.nin(left, right);
        default:
            throw new CartoParsingError(`Invalid binary operator '${node.operator}'.`);
    }
}

function parseUnaryOperation (node) {
    switch (node.operator) {
        case '-':
            return expressions.mul(-1, parseNode(node.argument));
        case '+':
            return parseNode(node.argument);
        default:
            throw new CartoParsingError(`Invalid unary operator '${node.operator}'.`);
    }
}

function parseIdentifier (node) {
    if (node.name.length && node.name[0] === '@') {
        node.name = '__cartovl_variable_' + node.name.substr(1);
    }
    if (node.name.startsWith('__cartovl_variable_')) {
        return expressions.variable(node.name.substr('__cartovl_variable_'.length));
    } else if (node.name[0] === '#') {
        return new Hex(node.name);
    } else if (node.name[0] === '$') {
        return expressions.property(node.name.substring(1));
    } else if (expressions.palettes[node.name.toUpperCase()]) {
        return expressions.palettes[node.name.toUpperCase()];
    } else if (lowerCaseExpressions[node.name.toLowerCase()]) {
        return lowerCaseExpressions[node.name.toLowerCase()];
    } else if (CSS_COLOR_NAMES.includes(node.name.toLowerCase())) {
        return new NamedColor(node.name.toLowerCase());
    } else {
        throw new CartoParsingError(`Invalid expression '${JSON.stringify(node)}'.`);
    }
}

function parseNode (node) {
    if (node.type === 'CallExpression') {
        return parseFunctionCall(node);
    } else if (node.type === 'Literal') {
        return node.value;
    } else if (node.type === 'ArrayExpression') {
        return node.elements.map(e => parseNode(e));
    } else if (node.type === 'BinaryExpression') {
        return parseBinaryOperation(node);
    } else if (node.type === 'UnaryExpression') {
        return parseUnaryOperation(node);
    } else if (node.type === 'Identifier') {
        return parseIdentifier(node);
    }
    throw new CartoParsingError(`Invalid expression '${JSON.stringify(node)}'.`);
}

function prepareJsep () {
    // jsep addBinaryOp pollutes its module scope, we need to remove the custom operators afterwards
    jsep.addBinaryOp(':', 0);
    jsep.addBinaryOp('^', 11);
    jsep.addBinaryOp('or', 1);
    jsep.addBinaryOp('OR', 1);
    jsep.addBinaryOp('and', 2);
    jsep.addBinaryOp('AND', 2);
    jsep.addBinaryOp('in', 13);
    jsep.addBinaryOp('IN', 1);
    jsep.addBinaryOp('nin', 13);
    jsep.addBinaryOp('NIN', 13);
    jsep.addIdentifierChar('@');
    jsep.addIdentifierChar('#');
    jsep.removeLiteral('true');
    jsep.removeLiteral('false');
}

function cleanJsep () {
    jsep.removeBinaryOp('in');
    jsep.removeBinaryOp('IN');
    jsep.removeBinaryOp('nin');
    jsep.removeBinaryOp('NIN');
    jsep.removeBinaryOp('and');
    jsep.removeBinaryOp('AND');
    jsep.removeBinaryOp('or');
    jsep.removeBinaryOp('OR');
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
export function cleanComments (str) {
    const mode = {
        singleQuote: false,
        doubleQuote: false,
        blockComment: false,
        lineComment: false,
        escape: 0
    };

    // Adding chars to avoid index checking
    str = ('_' + str + '_').split('');

    for (let i = 0, l = str.length; i < l; i++) {
        if (mode.singleQuote) {
            if (str[i] === '\\') {
                mode.escape++;
            } else if (str[i] === '\'' && mode.escape % 2 === 0) {
                mode.singleQuote = false;
                mode.escape = 0;
            }
            continue;
        }

        if (mode.doubleQuote) {
            if (str[i] === '\\') {
                mode.escape++;
            } else if (str[i] === '"' && mode.escape % 2 === 0) {
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
