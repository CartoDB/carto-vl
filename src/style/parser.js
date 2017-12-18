
import jsep from 'jsep';
import * as functions from './functions';
import * as schema from '../schema';

const aggFns = ['sum', 'avg', 'mode', 'min', 'max'];

var lowerCaseFunctions = {};
Object.keys(functions).filter(
    name => name[0] == name[0].toLowerCase()
).map(name => {
    lowerCaseFunctions[name.toLocaleLowerCase()] = functions[name];
});


function parseNodeForSchema(node) {
    if (node.type == 'CallExpression') {
        const args = node.arguments.map(arg => parseNodeForSchema(arg));
        const name = node.callee.name.toLowerCase();
        if (aggFns.includes(name)) {
            return flattenArray(args).map(c => { c.aggFN = name; return c; });
        } else if (lowerCaseFunctions[name]) {
            return flattenArray(args);
        }
        throw new Error(`Invalid function name '${node.callee.name}'`);
    } else if (node.type == 'Literal') {
        return [];
    } else if (node.type == 'ArrayExpression') {
        return flattenArray(node.elements.map(e => parseNodeForSchema(e)));
    } else if (node.type == 'BinaryExpression') {
        const left = parseNodeForSchema(node.left);
        const right = parseNodeForSchema(node.right);
        return left.concat(right);
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
            return [{ name: node.name.substring(1) }];
        } else if (functions.schemas[node.name.toLowerCase()]) {
            return [];
        } else if (lowerCaseFunctions[node.name.toLowerCase()]) {
            return [];
        }
    }
    throw new Error(`Invalid expression '${JSON.stringify(node)}'`);
}

function parseStyleNamedExprForSchema(node, protoSchema) {
    if (node.operator != ':') {
        throw new Error('Invalid syntax');
    }
    const name = node.left.name;
    if (!name) {
        throw new Error('Invalid syntax');
    }
    if (name == 'resolution') {
        protoSchema.aggRes = node.right;
    } else {
        protoSchema.properties = protoSchema.properties.concat(parseNodeForSchema(node.right));
    }
}

function flattenArray(x) {
    return x.reduce((a, b) => a.concat(b), [])
}

export function protoSchemaIsEquals(a, b) {
    console.log(a, b)
    if (!a || !b) {
        return false;
    }
    if (a.properties.length != b.properties.length) {
        return false;
    }
    const l = a.properties.map((_, index) =>
        a.properties[index].name == b.properties[index].name && a.properties[index].aggFN == b.properties[index].aggFN
    );
    return l.every(x => x) && a.aggRes == b.aggRes;
}

function compactProtoSchema(proto) {
    proto.properties = proto.properties.filter(x =>
        x == proto.properties.find(y => y.name == x.name && y.aggFN == x.aggFN)
    );
}

export function getSchema(str) {
    jsep.addBinaryOp(":", 1);
    jsep.addBinaryOp("^", 10);
    const ast = jsep(str);
    let protoSchema = {
        properties: []
    };
    console.log("AST", ast);
    if (ast.type == "Compound") {
        ast.body.map(node => parseStyleNamedExprForSchema(node, protoSchema));
    } else {
        parseStyleNamedExprForSchema(node, protoSchema);
    }
    jsep.removeBinaryOp("^");
    jsep.removeBinaryOp(":");
    compactProtoSchema(protoSchema);

    console.log(protoSchema);
    return protoSchema;
}

/**
 * @jsapi
 * @param {*} str
 * @param {*} schema
 */
export function parseStyleExpression(str, schema) {
    // jsep addBinaryOp pollutes its module scope, we need to remove the custom operators afterwards
    jsep.addBinaryOp("^", 10);
    const r = parseNode(jsep(str), schema);
    jsep.removeBinaryOp("^");
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
    jsep.addBinaryOp(":", 1);
    jsep.addBinaryOp("^", 10);
    const ast = jsep(str);
    let style = {};
    if (ast.type == "Compound") {
        ast.body.map(node => parseStyleNamedExpr(style, node, schema));
    } else {
        parseStyleNamedExpr(style, node, schema);
    }
    console.log(style);
    jsep.removeBinaryOp("^");
    jsep.removeBinaryOp(":");
    return style;
}

function parseNode(node, schema) {
    if (node.type == 'CallExpression') {
        const args = node.arguments.map(arg => parseNode(arg, schema));
        const name = node.callee.name.toLowerCase();
        if (aggFns.includes(name)) {
            //args[0].name = args[0].name + '_' + name;
            return args[0];
        }
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
            case "*":
                return functions.floatMul(left, right, schema);
            case "/":
                return functions.floatDiv(left, right, schema);
            case "+":
                return functions.floatAdd(left, right, schema);
            case "-":
                return functions.floatSub(left, right, schema);
            case "%":
                return functions.floatMod(left, right, schema);
            case "^":
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
        } else if (functions.schemas[node.name.toLowerCase()]) {
            return functions.schemas[node.name.toLowerCase()]();
        } else if (lowerCaseFunctions[node.name.toLowerCase()]) {
            return lowerCaseFunctions[node.name.toLowerCase()];
        }
    }
    throw new Error(`Invalid expression '${JSON.stringify(node)}'`);
}


