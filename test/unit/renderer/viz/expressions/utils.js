import Metadata from '../../../../../src/renderer/Metadata';
import * as s from '../../../../../src/renderer/viz/expressions';

const metadata = new Metadata({
    properties: {
        number: {
            type: 'number',
            min: 0,
            max: 10
        },
        category: {
            type: 'category',
            categories: [{ name: 'category0' }, { name: 'category1' }, { name: 'category2' }]
        }
    }
});

// Validate feature independence checks at constructor and compile times, mark the dependent argument with 'dependent' in argTypes
export function validateFeatureDependentErrors (expressionName, argTypes) {
    {
        const args = argTypes.map(type => type === 'dependent' ? 'number-property' : type).map(getPropertyArg);
        it(`${expressionName}(${args.map(arg => arg[1]).join(', ')}) should throw at compile time a feature dependent error`, () => {
            const expr = s[expressionName](...args.map(arg => arg[0]));
            expect(() =>
                expr._bindMetadata(metadata)
            ).toThrowError(new RegExp(`[\\s\\S]*${expressionName}[\\s\\S]*invalid.*parameter[\\s\\S]*dependent[\\s\\S]*`, 'g'));
        });
    }
    {
        const v = s.variable('var1');
        const args = argTypes.map(type => type === 'dependent' ? [v, '{alias to numeric property}'] : getPropertyArg(type));
        it(`${expressionName}(${args.map(arg => arg[1]).join(', ')}) should throw at compile time a feature dependent error`, () => {
            const expr = s[expressionName](...args.map(arg => arg[0]));
            v._resolveAliases({ var1: s.property('number') });
            expect(() =>
                expr._bindMetadata(metadata)
            ).toThrowError(new RegExp(`[\\s\\S]*${expressionName}[\\s\\S]*invalid.*parameter[\\s\\S]*dependent[\\s\\S]*`, 'g'));
        });
    }
}

export function validateTypeErrors (expressionName, argTypes, regexGenerator = null) {
    const simpleArgs = argTypes.map(getSimpleArg);
    _validateCompileTimeTypeError(expressionName, simpleArgs, regexGenerator);
}

export function validateMaxArgumentsError (expressionName, args) {
    it(`${expressionName}(${args.map(arg => arg[1]).join(', ')}) should throw at compile time`, () => {
        expect(() => {
            s[expressionName](...args.map(arg => arg[0]));
        }).toThrowError(new RegExp(`[\\s\\S]*${expressionName}[\\s\\S]*accepts.*arguments[\\s\\S]*passed[\\s\\S]*`, 'g'));
    });
}

function equalArgs (argsA, argsB) {
    if (argsA.length !== argsB.length) {
        return false;
    }

    return argsA.every((arg, index) => argsB[index] === arg);
}

function _validateCompileTimeTypeError (expressionName, args, regexGenerator = null) {
    const regex = regexGenerator ? regexGenerator(expressionName, args)
        : new RegExp(`[\\s\\S]*${expressionName}[\\s\\S]*invalid.*parameter[\\s\\S]*type[\\s\\S]*`, 'g');
    it(`${expressionName}(${args.map(arg => arg[1]).join(', ')}) should throw at compile time`, () => {
        expect(() => {
            const expression = s[expressionName](...args.map(arg => arg[0]));
            expression._bindMetadata(metadata);
        }).toThrowError(regex);
    });
}

export function validateStaticType (expressionName, argTypes, expectedType) {
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
export function validateDynamicType (expressionName, argTypes, expectedType) {
    describe(`valid ${expressionName}(${argTypes.join(', ')})`, () => {
        validateCompileTimeType(expressionName, argTypes.map(getPropertyArg), expectedType);
    });
}

function validateConstructorTimeType (expressionName, args, expectedType) {
    it(`${expressionName}(${args.map(arg => arg[1]).join(', ')}) should be of type '${expectedType}' at constructor time`, () => {
        expect(
            s[expressionName](...args.map(arg => arg[0])).type
        ).toEqual(expectedType);
    });
}

function validateCompileTimeType (expressionName, args, expectedType) {
    it(`${expressionName}(${args.map(arg => arg[1]).join(', ')}) should be of type '${expectedType}' at constructor time`, () => {
        expect(
            compile(s[expressionName](...args.map(arg => arg[0]))).type
        ).toEqual(expectedType);
    });
}

function getSimpleArg (type) {
    switch (type) {
        case 'number':
            return [s.number(0), '0'];
        case 'number-array':
            return [s.array([s.number(0)]), '[0]'];
        case 'number-property':
            return [s.property('number'), '$number'];
        case 'category':
            return [s.category('category'), '\'category\''];
        case 'category-array':
            return [s.array([s.category('category')]), '[\'category\']'];
        case 'category-property':
            return [s.property('category'), '$category'];
        case 'color':
            return [s.hsv(0, 0, 0), 'hsv(0, 0, 0)'];
        case 'color-array':
            return [s.array(s.hsv(0, 0, 0)), '[hsv(0, 0, 0)]'];
        case 'palette':
            return [s.palettes.PRISM, 'PRISM'];
        case 'image-array':
            return [[s.image('wadus.svg')], '[image(\'wadus\')]'];
        default:
            return [type, `${type}`];
    }
}

function getPropertyArg (type) {
    switch (type) {
        case 'number':
        case 'number-property':
            return [s.property('number'), '$number'];
        case 'number-array':
            return [s.array([s.number(0)]), '[0]'];
        case 'category':
        case 'category-property':
            return [s.property('category'), '$category'];
        case 'category-array':
            return [s.array([s.category('category')]), '[\'category\']'];
        case 'color':
        case 'color-property':
            return [s.hsv(s.property('number'), 0, 0), 'hsv($number, 0, 0)'];
        case 'color-array':
            return [s.array(s.hsv(0, 0, 0)), '[hsv(0, 0, 0)]'];
        case 'palette':
            return [s.palettes.PRISM, 'PRISM'];
        case 'image-array':
            return [[s.image('wadus.svg')], '[image(\'wadus\')]'];
        default:
            return [type, `${type}`];
    }
}

function compile (expression) {
    expression._bindMetadata(metadata);
    return expression;
}
