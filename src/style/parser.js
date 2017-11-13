
import jsep from 'jsep';
import * as functions from './functions';

//TODO document style expressions
//TODO create complete style API, a way to define a color and a width style at the same time, we just have style expressions now
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
            case 'Blend':
                return functions.Blend(...args);
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
    } else if (node.type == 'Identifier') {
        if (node.name[0] == '$') {
            return functions.Property(node.name.substring(1));
        }else if(functions[node.name]){
            return functions[node.name]();
        }
    }
    throw new Error(`Invalid expression '${JSON.stringify(node)}'`);
}


