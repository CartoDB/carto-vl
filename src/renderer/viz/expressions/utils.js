import { number, category, list, rgba } from '../expressions';
import BaseExpression from './base';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../errors/carto-validation-error';
import CartoParsingError from '../../../errors/carto-parsing-error';
import { interpolateRGBAinCieLAB } from '../colorspaces';

export const DEFAULT = undefined;

export function checkMaxArguments (constructorArguments, maxArguments, expressionName) {
    if (constructorArguments.length > maxArguments) {
        throw new CartoValidationError(`${cvt.TOO_MANY_ARGS} Expression '${expressionName}' accepts just ${maxArguments} arguments, but ${constructorArguments.length} were passed.`);
    }
}

export function checkMinArguments (constructorArguments, minArguments, expressionName) {
    if (constructorArguments.length < minArguments) {
        throw new CartoValidationError(`${cvt.NOT_ENOUGH_ARGS} Expression '${expressionName}' accepts at least ${minArguments} arguments, but ${constructorArguments.length} were passed.`);
    }
}

export function checkExactNumberOfArguments (constructorArguments, numArguments, expressionName) {
    if (constructorArguments.length !== numArguments) {
        throw new CartoValidationError(`${cvt.WRONG_NUMBER_ARGS} Expression '${expressionName}' accepts exactly ${numArguments} arguments, but ${constructorArguments.length} were passed.`);
    }
}

// To support literals (string and numeric) out of the box we need to cast them implicitly on constructors
export function implicitCast (value) {
    if (_isNumber(value)) {
        return number(value);
    }

    if (typeof value === 'string') {
        return category(value);
    }

    if (Array.isArray(value)) {
        return list(value);
    }

    return value;
}

export function hexToRgb (hex) {
    // Evaluate #ABC
    let result = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(hex);
    if (result) {
        return {
            r: parseInt(result[1] + result[1], 16),
            g: parseInt(result[2] + result[2], 16),
            b: parseInt(result[3] + result[3], 16),
            a: 1
        };
    }

    // Evaluate #ABCD
    result = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(hex);
    if (result) {
        return {
            r: parseInt(result[1] + result[1], 16),
            g: parseInt(result[2] + result[2], 16),
            b: parseInt(result[3] + result[3], 16),
            a: parseInt(result[4] + result[4], 16) / 255
        };
    }

    // Evaluate #ABCDEF
    result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        return {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
            a: 1
        };
    }

    // Evaluate #ABCDEFAF
    result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        return {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
            a: parseInt(result[4], 16) / 255
        };
    }

    throw new CartoParsingError('Invalid hexadecimal color');
}

export function noOverrideColor () {
    return rgba(255, 255, 255, 0);
}

export function getOrdinalFromIndex (index) {
    const indexToOrdinal = {
        1: 'first',
        2: 'second',
        3: 'third',
        4: 'fourth'
    };
    return indexToOrdinal[index] || String(index);
}

export function getStringErrorPreface (expressionName, parameterName, parameterIndex) {
    return `${expressionName}(): invalid ${getOrdinalFromIndex(parameterIndex + 1)} parameter '${parameterName}'`;
}

export function throwInvalidType (expressionName, parameterName, parameterIndex, expectedType, actualType) {
    throw new CartoValidationError(`${cvt.INCORRECT_TYPE} ${getStringErrorPreface(expressionName, parameterName, parameterIndex)}
    expected type was '${expectedType}', actual type was '${actualType}'`);
}

export function throwInvalidInstance (expressionName, parameterName, parameterIndex, expectedClass) {
    throw new CartoValidationError(`${cvt.INCORRECT_TYPE} ${getStringErrorPreface(expressionName, parameterName, parameterIndex)}
    expected type was instance of '${expectedClass.name}'`);
}

export function throwInvalidNumber (expressionName, parameterName, parameterIndex, number) {
    throw new CartoValidationError(`${cvt.INCORRECT_TYPE} ${getStringErrorPreface(expressionName, parameterName, parameterIndex)}
    type of '${number}' is ${typeof number}, 'number' was expected`);
}

export function throwInvalidArray (expressionName, parameterName, parameterIndex, array) {
    throw new CartoValidationError(`${cvt.INCORRECT_TYPE} ${getStringErrorPreface(expressionName, parameterName, parameterIndex)}
    '${array}' is not an array`);
}

export function throwInvalidString (expressionName, parameterName, parameterIndex, str) {
    throw new CartoValidationError(`${cvt.INCORRECT_TYPE} ${getStringErrorPreface(expressionName, parameterName, parameterIndex)}
    expected type was 'string', but ${str}' is not a string`);
}

export function throwInvalidStringValue (expressionName, parameterName, parameterIndex, str, validValues) {
    throw new CartoValidationError(`${cvt.INCORRECT_TYPE} ${getStringErrorPreface(expressionName, parameterName, parameterIndex)}
    value '${str}' is not valid. It should be one of ${validValues.map(v => `'${v}'`).join(', ')}`);
}

// Returns true if the argument is of a type that cannot be strictly checked at constructor time
export function isArgConstructorTimeTyped (arg) {
    switch (arg) {
        case 'number':
        case 'number-list':
        case 'number-property':
        case 'category':
        case 'category-list':
        case 'category-property':
            return false;
        default:
            return true;
    }
}

export function checkExpression (expressionName, parameterName, parameterIndex, parameter) {
    if (!(parameter instanceof BaseExpression)) {
        throw new CartoValidationError(`${cvt.INCORRECT_TYPE} ${getStringErrorPreface(expressionName, parameterName, parameterIndex)}
        '${parameter}' is not of type "carto.expressions.Base"`);
    }
}

export function checkType (expressionName, parameterName, parameterIndex, expectedType, parameter) {
    checkExpression(expressionName, parameterName, parameterIndex, parameter);
    if (Array.isArray(expectedType)) {
        const ok = expectedType.some(type =>
            parameter.type === type
        );
        if (!ok) {
            throw new CartoValidationError(`${cvt.INCORRECT_TYPE} ${getStringErrorPreface(expressionName, parameterName, parameterIndex)}
            expected type was one of ${expectedType.join()}, actual type was '${parameter.type}'`);
        }
    } else if (parameter.type !== expectedType) {
        throwInvalidType(expressionName, parameterName, parameterIndex, expectedType, parameter.type);
    }
}

export function checkInstance (expressionName, parameterName, parameterIndex, expectedClass, parameter) {
    checkExpression(expressionName, parameterName, parameterIndex, parameter);
    if (!(parameter.isA(expectedClass))) {
        throwInvalidInstance(expressionName, parameterName, parameterIndex, expectedClass);
    }
}

export function checkNumber (expressionName, parameterName, parameterIndex, number) {
    if (!_isNumber(number)) {
        throwInvalidNumber(expressionName, parameterName, parameterIndex, number);
    }
}

export function checkString (expressionName, parameterName, parameterIndex, str) {
    if (typeof str !== 'string') {
        throwInvalidString(expressionName, parameterName, parameterIndex, str);
    }
}

export function checkStringValue (expressionName, parameterName, parameterIndex, str, validValues) {
    if (typeof str !== 'string') {
        throwInvalidString(expressionName, parameterName, parameterIndex, str);
    } else if (!validValues.includes(str)) {
        throwInvalidStringValue(expressionName, parameterName, parameterIndex, str, validValues);
    }
}

export function checkArray (expressionName, parameterName, parameterIndex, array) {
    if (!Array.isArray(array)) {
        throwInvalidArray(expressionName, parameterName, parameterIndex, array);
    }
}

export function checkFeatureIndependent (expressionName, parameterName, parameterIndex, parameter) {
    if (parameter.isFeatureDependent()) {
        throw new CartoValidationError(`${cvt.INCORRECT_VALUE} ${getStringErrorPreface(expressionName, parameterName, parameterIndex)}
        parameter cannot be feature dependent`);
    }
}

export function checkFeatureDependent (expressionName, parameterName, parameterIndex, parameter) {
    if (!parameter.isFeatureDependent()) {
        throw new CartoValidationError(`${cvt.INCORRECT_VALUE} ${getStringErrorPreface(expressionName, parameterName, parameterIndex)}
        parameter must be feature dependent`);
    }
}

export function clamp (x, min, max) {
    return Math.min(Math.max(x, min), max);
}

export function mix (x, y, a) {
    return typeof x === 'number'
        ? x * (1 - a) + y * a
        : interpolateRGBAinCieLAB(x, y, a);
}

export function fract (x) {
    return x - Math.floor(x);
}

function _isNumber (value) {
    return Number.isFinite(value) || value === Infinity || value === -Infinity || Number.isNaN(value);
}
