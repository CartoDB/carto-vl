
import jsep from 'jsep';
import * as functions from './functions';

//TODO document style expressions
//TODO create complete style API, a way to define a color and a width style at the same time, we just have style expressions now
/*
  Returns a valid style expression or throws an exception upon invalid inputs.
*/
var lowerCaseFunctions = {};
Object.keys(functions).map(name => {
    lowerCaseFunctions[name.toLocaleLowerCase()] = functions[name];
});

export function parseStyleExpression(str, scheme) {
    // jsep addBinaryOp pollutes its module scope, we need to remove the custom operators afterwards
    jsep.addBinaryOp("^", 10);
    const r = parseNode(jsep(str), scheme);
    jsep.removeBinaryOp("^");
    return r;
}

function parseNode(node, scheme) {
    if (node.type == 'CallExpression') {
        const args = node.arguments.map(arg => parseNode(arg, scheme));
        const name = node.callee.name.toLowerCase();
        if (lowerCaseFunctions[name]) {
            return lowerCaseFunctions[name](...args, scheme);
        }
        throw new Error(`Invalid function name '${node.callee.name}'`);
    } else if (node.type == 'Literal') {
        return node.value;
    } else if (node.type == 'ArrayExpression') {
        return node.elements.map(e => parseNode(e, scheme));
    } else if (node.type == 'BinaryExpression') {
        const left = parseNode(node.left, scheme);
        const right = parseNode(node.right, scheme);
        switch (node.operator) {
            case "*":
                return functions.FloatMul(left, right, scheme);
            case "/":
                return functions.FloatDiv(left, right, scheme);
            case "+":
                return functions.FloatAdd(left, right, scheme);
            case "-":
                return functions.FloatSub(left, right, scheme);
            case "^":
                return functions.FloatPow(left, right, scheme);
            default:
                throw new Error(`Invalid binary operator '${node.operator}'`);
        }
    } else if (node.type == 'UnaryExpression') {
        switch (node.operator) {
            case '-':
                return functions.FloatMul(-1, parseNode(node.argument, scheme));
            case '+':
                return parseNode(node.argument, scheme);
            default:
                throw new Error(`Invalid unary operator '${node.operator}'`);
        }
    } else if (node.type == 'Identifier') {
        if (node.name[0] == '$') {
            return functions.Property(node.name.substring(1), scheme);
        } else if (functions.schemes[node.name.toLowerCase()]) {
            return functions.schemes[node.name.toLowerCase()]();
        }
    }
    throw new Error(`Invalid expression '${JSON.stringify(node)}'`);
}


