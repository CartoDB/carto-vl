import * as s from '../../../../../src/core/viz/functions';

const metadata = {
    columns: [
        {
            name: 'number',
            type: 'number'
        },
        {
            name: 'string',
            type: 'string',
            categoryNames: ['string0', 'string1', 'string2']
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
        expect(() => {
            const expression = s[expressionName](...args.map(arg => arg[0]));
            expression._compile(metadata);
        }).toThrowError(/[\s\S]*invalid.*parameter[\s\S]*type[\s\S]*/g);
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
        case 'number':
            return [s.number(0), '0'];
        case 'number-array':
            return [s.array([s.number(0)]), '[0]'];
        case 'number-property':
            return [s.property('number'), '$number'];
        case 'string':
            return [s.string('string'), '\'string\''];
        case 'string-array':
            return [s.array([s.string('string')]), '[\'string\']'];
        case 'string-property':
            return [s.property('string'), '$string'];
        case 'color':
            return [s.hsv(0, 0, 0), 'hsv(0, 0, 0)'];
        case 'color-array':
            return [s.array(s.hsv(0, 0, 0)), '[hsv(0, 0, 0)]'];
        case 'palette':
            return [s.palettes.PRISM, 'PRISM'];
        default:
            return [type, `${type}`];
    }
}
function getPropertyArg(type) {
    switch (type) {
        case 'number':
        case 'number-property':
            return [s.property('number'), '$number'];
        case 'number-array':
            return [s.array([s.number(0)]), '[0]'];
        case 'string':
        case 'string-property':
            return [s.property('string'), '$string'];
        case 'string-array':
            return [s.array([s.string('string')]), '[\'string\']'];
        case 'color':
        case 'color-property':
            return [s.hsv(s.property('number'), 0, 0), 'hsv($number, 0, 0)'];
        case 'color-array':
            return [s.array(s.hsv(0, 0, 0)), '[hsv(0, 0, 0)]'];
        case 'palette':
            return [s.palettes.PRISM, 'PRISM'];
        default:
            return [type, `${type}`];
    }
}

function compile(expression) {
    expression._compile(metadata);
    return expression;
}
