
import jsep from 'jsep';
import * as functions from './functions';

// TODO use Schema classes

const aggFns = ['sum', 'avg', 'mode', 'min', 'max'];

var lowerCaseFunctions = {};
Object.keys(functions).filter(
    name => name[0] == name[0].toLowerCase()
).map(name => {
    lowerCaseFunctions[name.toLocaleLowerCase()] = functions[name];
});

class ProtoSchema {
    constructor(name, aggFN) {
        this.properties = {};
        this.propertyList = [];
        if (name) {
            this.addPropertyAccess(name, aggFN);
        }
    }
    addPropertyAccess(name, aggFN) {
        if (!this.properties[name]) {
            this.properties[name] = {
                name: name,
                aggFN: new Set()
            };
            this.propertyList.push(this.properties[name]);
        }
        this.properties[name].aggFN.add(aggFN);
    }
    setAggFN(fn) {
        this.propertyList.map(p => p.aggFN.delete('raw'));
        this.propertyList.map(p => p.aggFN.add(fn));
        return this;
    }
}
function union(b) {
    let newProto = new ProtoSchema();
    if (!Array.isArray(b)) {
        b = [b];
    }
    b = b.filter(x => x != null);
    b.map(
        x => x.propertyList.map(
            p => {
                p.aggFN.forEach(
                    fn => newProto.addPropertyAccess(p.name, fn)
                );
            }
        )
    );
    newProto.aggRes = b.map(x => x.aggRes).reduce((x, y) => x || y, undefined);
    return newProto;
}

function parseNodeForSchema(node) {
    if (node.type == 'CallExpression') {
        const args = node.arguments.map(arg => parseNodeForSchema(arg));
        const name = node.callee.name.toLowerCase();
        if (aggFns.includes(name)) {
            return args[0].setAggFN(name);
        } else if (lowerCaseFunctions[name]) {
            return union(args);
        }
        throw new Error(`Invalid function name '${node.callee.name}'`);
    } else if (node.type == 'Literal') {
        return null;
    } else if (node.type == 'ArrayExpression') {
        return null;
    } else if (node.type == 'BinaryExpression') {
        const left = parseNodeForSchema(node.left);
        const right = parseNodeForSchema(node.right);
        return union([left, right]);
    } else if (node.type == 'UnaryExpression') {
        switch (node.operator) {
        case '-':
            return parseNodeForSchema(node.argument);
        case '+':
            return parseNodeForSchema(node.argument);
        default:
            throw new Error(`Invalid unary operator '${node.operator}'`);
        }
    } else if (node.type == 'Identifier') {
        if (node.name[0] == '$') {
            return new ProtoSchema(node.name.substring(1), 'raw');
        } else if (functions.palettes[node.name.toLowerCase()]) {
            return null;
        } else if (lowerCaseFunctions[node.name.toLowerCase()]) {
            return null;
        }
    }
    throw new Error(`Invalid expression '${JSON.stringify(node)}'`);
}

function parseStyleNamedExprForSchema(node) {
    if (node.operator != ':') {
        throw new Error('Invalid syntax');
    }
    const name = node.left.name;
    if (!name) {
        throw new Error('Invalid syntax');
    }
    if (name == 'resolution') {
        let p = new ProtoSchema();
        p.aggRes = node.right.value;
        return p;
    } else {
        return parseNodeForSchema(node.right);
    }
}

const isSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value));

export function protoSchemaIsEquals(a, b) {
    if (!a || !b) {
        return false;
    }
    if (a.propertyList.length != b.propertyList.length) {
        return false;
    }
    const l = a.propertyList.map((_, index) =>
        a.propertyList[index].name == b.propertyList[index].name && isSetsEqual(a.propertyList[index].aggFN, b.propertyList[index].aggFN)
    );
    return l.every(x => x) && a.aggRes == b.aggRes;
}

export function getSchema(str) {
    jsep.addBinaryOp(':', 1);
    jsep.addBinaryOp('^', 10);
    const ast = jsep(str);
    let protoSchema = null;
    if (ast.type == 'Compound') {
        protoSchema = union(ast.body.map(node => parseStyleNamedExprForSchema(node)));
    } else {
        protoSchema = union(parseStyleNamedExprForSchema(ast));
    }
    jsep.removeBinaryOp('^');
    jsep.removeBinaryOp(':');

    return protoSchema;
}

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

function parseStyleNamedExpr(style, node, schema) {
    if (node.operator != ':') {
        throw new Error('Invalid syntax');
    }
    const name = node.left.name;
    if (!name) {
        throw new Error('Invalid syntax');
    }
    const value = parseNode(node.right, schema);
    style[name] = value;
}
export function parseStyle(str, schema) {
    // jsep addBinaryOp pollutes its module scope, we need to remove the custom operators afterwards
    jsep.addBinaryOp(':', 1);
    jsep.addBinaryOp('^', 10);
    const ast = jsep(str);
    let style = {};
    if (ast.type == 'Compound') {
        ast.body.map(node => parseStyleNamedExpr(style, node, schema));
    } else {
        parseStyleNamedExpr(style, ast, schema);
    }
    jsep.removeBinaryOp('^');
    jsep.removeBinaryOp(':');
    return style;
}

function parseNode(node, schema) {
    if (node.type == 'CallExpression') {
        const name = node.callee.name.toLowerCase();
        if (aggFns.includes(name)) {
            //node.arguments[0].name += '_' + name;
            const args = node.arguments.map(arg => parseNode(arg, schema));
            return args[0];
        }
        const args = node.arguments.map(arg => parseNode(arg, schema));
        if (lowerCaseFunctions[name]) {
            return lowerCaseFunctions[name](...args, schema);
        }
        throw new Error(`Invalid function name '${node.callee.name}'`);
    } else if (node.type == 'Literal') {
        return node.value;
    } else if (node.type == 'ArrayExpression') {
        return node.elements.map(e => parseNode(e, schema));
    } else if (node.type == 'BinaryExpression') {
        const left = parseNode(node.left, schema);
        const right = parseNode(node.right, schema);
        switch (node.operator) {
        case '*':
            return functions.floatMul(left, right, schema);
        case '/':
            return functions.floatDiv(left, right, schema);
        case '+':
            return functions.floatAdd(left, right, schema);
        case '-':
            return functions.floatSub(left, right, schema);
        case '%':
            return functions.floatMod(left, right, schema);
        case '^':
            return functions.floatPow(left, right, schema);
        default:
            throw new Error(`Invalid binary operator '${node.operator}'`);
        }
    } else if (node.type == 'UnaryExpression') {
        switch (node.operator) {
        case '-':
            return functions.floatMul(-1, parseNode(node.argument, schema));
        case '+':
            return parseNode(node.argument, schema);
        default:
            throw new Error(`Invalid unary operator '${node.operator}'`);
        }
    } else if (node.type == 'Identifier') {
        if (node.name[0] == '$') {
            return functions.property(node.name.substring(1), schema);
        } else if (functions.palettes[node.name.toLowerCase()]) {
            return functions.palettes[node.name.toLowerCase()]();
        } else if (lowerCaseFunctions[node.name.toLowerCase()]) {
            return lowerCaseFunctions[node.name.toLowerCase()];
        }
    }
    throw new Error(`Invalid expression '${JSON.stringify(node)}'`);
}


