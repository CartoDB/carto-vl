
import jsep from 'jsep';
import * as functions from './functions';

export default function parseStyle(str) {
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
                break;
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
                //TODO check left & right types => float
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
                break;
        }
    }
    console.warn(node);
    return null;
}


