import { float, category, time } from '../functions';
import Expression from './expression';

export const DEFAULT = undefined;

// To support literals (string and numeric) out of the box we need to cast them implicitly on constructors
export function implicitCast(value) {
    if (Number.isFinite(value)) {
        return float(value);
    }
    if (typeof value == 'string') {
        if (!Number.isNaN(Date.parse(value))) {
            return time(new Date(value));
        }
        return category(value);
    }
    if (!(value instanceof Expression) && value.type !== 'paletteGenerator' && value.type !== 'float') {
        throw new Error('value cannot be casted');
    }
    return value;
}

export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function getOrdinalFromIndex(index) {
    const indexToOrdinal = {
        1: 'first',
        2: 'second',
        3: 'third',
        4: 'fourth'
    };
    return indexToOrdinal[index] || String(index);
}

export function getStringErrorPreface(expressionName, parameterName, parameterIndex) {
    return `${expressionName}(): invalid ${getOrdinalFromIndex(parameterIndex + 1)} parameter '${parameterName}'`;
}
export function throwInvalidType(expressionName, parameterName, parameterIndex, expectedType, actualType) {
    throw new Error(`${getStringErrorPreface(expressionName, parameterName, parameterIndex)}
expected type was '${expectedType}', actual type was '${actualType}'`);
}

export function throwInvalidInstance(expressionName, parameterName, parameterIndex, expectedClass, actualInstance) {
    throw new Error(`${getStringErrorPreface(expressionName, parameterName, parameterIndex)}
    '${actualInstance}' is not an instance of '${expectedClass.name}'`);
}

export function throwInvalidNumber(expressionName, parameterName, parameterIndex, number) {
    throw new Error(`${getStringErrorPreface(expressionName, parameterName, parameterIndex)}
    '${number}' is not a finite number`);
}

// Try to check the type, but accept undefined types without throwing
// This is useful to make constructor-time checks, at contructor-time some types can be already known and errors can be throw.
// Constructor-time is the best time to throw, but metadata is not provided yet, therefore, the checks cannot be complete,
// they must be loose
export function checkLooseType(expressionName, parameterName, parameterIndex, expectedType, parameter) {
    if (parameter.type != expectedType && parameter.type !== undefined) {
        throwInvalidType(expressionName, parameterName, parameterIndex, expectedType, parameter.type);
    }
}

export function checkType(expressionName, parameterName, parameterIndex, expectedType, parameter) {
    if (parameter.type != expectedType) {
        throwInvalidType(expressionName, parameterName, parameterIndex, expectedType, parameter.type);
    }
}

export function checkInstance(expressionName, parameterName, parameterIndex, expectedClass, parameter) {
    if (!(parameter instanceof expectedClass)) {
        throwInvalidInstance(expressionName, parameterName, parameterIndex, expectedClass, parameter.type);
    }
}

export function checkNumber(expressionName, parameterName, parameterIndex, number) {
    if (!Number.isFinite(number)) {
        throwInvalidNumber(expressionName, parameterName, parameterIndex, number);
    }
}


export function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
}

export function mix(x, y, a) {
    return x * (1 - a) + y * a;
}
