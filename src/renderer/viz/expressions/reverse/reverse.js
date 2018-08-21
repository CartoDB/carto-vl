import { implicitCast, checkMaxArguments, checkType } from '../utils';
import ReversePalette from './ReversePalette';
import ReverseArray from './ReverseArray';

export default function reverse (x) {
    checkMaxArguments(arguments, 1, 'reverse');
    x = implicitCast(x);
    checkType('reverse', 'x', 0, ['palette', 'number-array', 'category-array', 'color-array', 'time-array', 'image-array'], x);
    if (x.type === 'palette') {
        return new ReversePalette(x);
    } else {
        return new ReverseArray(x);
    }
}
