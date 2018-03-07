import { float, category, time } from '../functions';
import Expression from './expression';

export const DEFAULT = undefined;

// To support literals (string and numeric) out of the box we need to cast them implicitly on constructors
export function implicitCast(value) {
    if (Number.isFinite(value)) {
        return float(value);
    }
    if (typeof value == 'string') {
        if (Date.parse(value)) {
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

export function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
}

export function mix(x, y, a) {
    return x * (1 - a) + y * a;
}
