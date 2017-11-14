
import jsep from 'jsep';
import * as functions from './functions';

//TODO document style expressions
//TODO create complete style API, a way to define a color and a width style at the same time, we just have style expressions now
/*
  Returns a valid style expression or throws an exception upon invalid inputs.
*/
export function parseStyleExpression(str, meta) {
    // jsep addBinaryOp pollutes its module scope, we need to remove the custom operators afterwards
    jsep.addBinaryOp("^", 10);
    const r = parseNode(jsep(str), meta);
    jsep.removeBinaryOp("^");
    return r;
}

function parseNode(node, meta) {
    if (node.type == 'CallExpression') {
        const args = node.arguments.map(arg => parseNode(arg, meta));
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
        return node.elements.map(e => parseNode(e, meta));
    } else if (node.type == 'BinaryExpression') {
        const left = parseNode(node.left, meta);
        const right = parseNode(node.right, meta);
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
                return functions.FloatMul(-1, parseNode(node.argument, meta));
            case '+':
                return parseNode(node.argument, meta);
            default:
                throw new Error(`Invalid unary operator '${node.operator}'`);
        }
    } else if (node.type == 'Identifier') {
        if (node.name[0] == '$') {
            return functions.Property(node.name.substring(1), meta);
        }else if(functions.schemes[node.name.toLowerCase()]){
            return functions.schemes[node.name.toLowerCase()]();
        }
    }
    throw new Error(`Invalid expression '${JSON.stringify(node)}'`);
}


