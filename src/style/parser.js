
import jsep from 'jsep';
import * as functions from './functions';

//TODO document style expressions
//TODO create complete style API, a way to define a color and a width style at the same time, we just have style expressions now
/*
  Returns a valid style expression or throws an exception upon invalid inputs.
*/
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
    jsep.addBinaryOp("^", 10);
    const r = parseNode(jsep(str), schema);
    jsep.removeBinaryOp("^");
    return r;
}

function parseNode(node, schema) {
    if (node.type == 'CallExpression') {
        const args = node.arguments.map(arg => parseNode(arg, schema));
        const name = node.callee.name.toLowerCase();
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
        }
    }
    throw new Error(`Invalid expression '${JSON.stringify(node)}'`);
}


