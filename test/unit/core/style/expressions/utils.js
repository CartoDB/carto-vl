import * as s from '../../../../../src/core/style/functions';

const metadata = {
    columns: [
        {
            name: 'price',
            type: 'float'
        },
        {
            name: 'cat',
            type: 'category',
            categories: {
                10: {
                    name: 'red',
                    count: 10
                },
                11: {
                    name: 'blue',
                    count: 30
                },
                12: {
                    name: 'green',
                    count: 15
                }
            }
        }
    ],
};

export function validateDynamicTypeErrors(expressionName, argTypes) {
    describe(`invalid ${expressionName}(${argTypes.join(', ')})`, () => {
        validateConstructorTimeTypeError(expressionName, argTypes.map(getSimpleArg));
        validateCompileTimeTypeError(expressionName, argTypes.map(getPropertyArg));
    });
}

export function validateStaticTypeErrors(expressionName, argTypes) {
    describe(`invalid ${expressionName}(${argTypes.join(', ')})`, () => {
        const simpleArgs = argTypes.map(getSimpleArg);
        const propertyArgs = argTypes.map(getPropertyArg);
        validateConstructorTimeTypeError(expressionName, simpleArgs);
        if (!equalArgs(simpleArgs, propertyArgs)) {
            validateConstructorTimeTypeError(expressionName, propertyArgs);
        }
    });
}
function equalArgs(argsA, argsB) {
    if (argsA.length != argsB.length) {
        return false;
    }
    return argsA.every((arg, index) => argsB[index] == arg);
}
function validateConstructorTimeTypeError(expressionName, args) {
    it(`${expressionName}(${args.map(arg => arg[1]).join(', ')}) should throw at constructor time`, () => {
        expect(() =>
            s[expressionName](...args.map(arg => arg[0]))
        ).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*/g);
    });
}
function validateCompileTimeTypeError(expressionName, args) {
    it(`${expressionName}(${args.map(arg => arg[1]).join(', ')}) should throw at compile time`, () => {
        const expression = s[expressionName](...args.map(arg => arg[0]));
        expect(() =>
            expression._compile(metadata)
        ).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*type[\s\S]*/g);
    });
}



export function validateStaticType(expressionName, argTypes, expectedType) {
    describe(`valid ${expressionName}(${argTypes.join(', ')})`, () => {
        const simpleArgs = argTypes.map(getSimpleArg);
        const propertyArgs = argTypes.map(getPropertyArg);
        validateConstructorTimeType(expressionName, simpleArgs, expectedType);
        if (!equalArgs(simpleArgs, propertyArgs)) {
            validateConstructorTimeType(expressionName, propertyArgs, expectedType);
        }
        validateCompileTimeType(expressionName, propertyArgs, expectedType);
    });
}
export function validateDynamicType(expressionName, argTypes, expectedType) {
    describe(`valid ${expressionName}(${argTypes.join(', ')})`, () => {
        validateConstructorTimeType(expressionName, argTypes.map(getSimpleArg), expectedType);
        validateCompileTimeType(expressionName, argTypes.map(getPropertyArg), expectedType);
    });
}
function validateConstructorTimeType(expressionName, args, expectedType) {
    it(`${expressionName}(${args.map(arg => arg[1]).join(', ')}) should be of type '${expectedType}' at constructor time`, () => {
        expect(
            s[expressionName](...args.map(arg => arg[0])).type
        ).toEqual(expectedType);
    });
}
function validateCompileTimeType(expressionName, args, expectedType) {
    it(`${expressionName}(${args.map(arg => arg[1]).join(', ')}) should be of type '${expectedType}' at constructor time`, () => {
        expect(
            compile(s[expressionName](...args.map(arg => arg[0]))).type
        ).toEqual(expectedType);
    });
}

function getSimpleArg(type) {
    switch (type) {
        case 'float-property':
            return [s.property('price'), '$price'];
        case 'category-property':
            return [s.property('cat'), '$cat'];
        case 'float':
            return [s.float(0), '0'];
        case 'category':
            return [s.category('red'), '\'red\''];
        case 'color':
            return [s.hsv(0, 0, 0), 'hsv(0, 0, 0)'];
        case 'palette':
            return [s.palettes.prism, 'Prism'];
        default:
            return [type, `${type}`];
    }
}
function getPropertyArg(type) {
    switch (type) {
        case 'float-property':
        case 'float':
            return [s.property('price'), '$price'];
        case 'category-property':
        case 'category':
            return [s.property('cat'), '$cat'];
        case 'color':
            return [s.hsv(s.property('price'), 0, 0), 'hsv($price, 0, 0)'];
        case 'palette':
            return [s.palettes.prism, 'Prism'];
        default:
            return [type, `${type}`];
    }
}

function compile(expression) {
    expression._compile(metadata);
    return expression;
}
