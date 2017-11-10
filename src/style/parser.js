
import jsep from 'jsep';
import * as functions from './functions';

/*
  Returns a valid style expression or throws an exception upon invalid inputs.
*/
export function parseStyleExpression(str) {
    // jsep addBinaryOp pollutes its module scope, we need to remove the custom operators afterwards
    jsep.addBinaryOp("^", 10);
    const r = parseNode(jsep(str));
    jsep.removeBinaryOp("^");
    return r;
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
                throw new Error(`Invalid function name '${node.callee.name}'`);
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
                throw new Error(`Invalid binary operator '${node.operator}'`);
        }
    } else if (node.type == 'UnaryExpression') {
        switch (node.operator) {
            case '-':
                return functions.FloatMul(-1, parseNode(node.argument));
            case '+':
                return parseNode(node.argument);
            default:
                throw new Error(`Invalid unary operator '${node.operator}'`);
        }
    }
    throw new Error(`Invalid expression '${JSON.stringify(node)}'`);
}


