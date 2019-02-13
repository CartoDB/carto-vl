import Histogram from './Histogram';
import { checkMaxArguments, implicitCast } from '../utils';

export default class GlobalHistogram extends Histogram {
    constructor (property, sizeOrBuckets = 20, weight = 1) {
        checkMaxArguments(arguments, 3, 'globalHistogram');
        super({ property: implicitCast(property), weight: implicitCast(weight) });

        this._sizeOrBuckets = sizeOrBuckets;
        this._isViewport = false;
        this._hasBuckets = Array.isArray(sizeOrBuckets);
    }
}
