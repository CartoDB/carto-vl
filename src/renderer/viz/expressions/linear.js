import BaseExpression from './base';
import { checkExpression, implicitCast, checkType, checkMaxArguments, clamp } from './utils';
import { globalMin, globalMax } from '../expressions';
import { castTimeRange, msToDate } from '../../../utils/util';
import IdentityCodec from '../../../codecs/Identity';
import TZDate from '../../../utils/time/TZDate';
/**
* Linearly interpolates the value of a given input between a minimum and a maximum. If `min` and `max` are not defined they will
* default to `globalMin(input)` and `globalMax(input)`.
*
* @param {Number|Date} input - The input to be evaluated and interpolated, can be a numeric property or a date property
* @param {Number|Date} [min=globalMin(input)] - Numeric or date expression pointing to the lower limit
* @param {Number|Date} [max=globalMax(input)] - Numeric or date expression pointing to the higher limit
* @return {Number|Date}
*
* @example <caption> Color by $speed using the CARTOColor Prism by assigning the first color in Prism to features with speeds of 10 or less, the last color in Prism to features with speeds of 100 or more and a interpolated value for the speeds in between.</caption>
* const s = carto.expressions;
* const viz = new carto.Viz({
*   color: s.ramp(s.linear(s.prop('speed'), 10, 100), s.palettes.PRISM)
* });
*
* @example <caption> Color by $speed using the CARTOColor Prism by assigning the first color in Prism to features with speeds of 10 or less, the last color in Prism to features with speeds of 100 or more and a interpolated value for the speeds in between. (String)</caption>
* const viz = new carto.Viz(`
*   color: ramp(linear($speed, 10, 100), PRISM)
* `);
*
* @memberof carto.expressions
* @name linear
* @function
* @api
*/
export default class Linear extends BaseExpression {
    constructor (input, min, max, range) {
        checkMaxArguments(arguments, 4, 'linear');

        input = implicitCast(input);

        if (min && !(min instanceof BaseExpression) && max === undefined && range === undefined) {
            range = min;
            min = undefined;
            max = undefined;
        }

        if (min === undefined && max === undefined) {
            min = globalMin(input);
            max = globalMax(input);
        }

        min = implicitCast(min);
        max = implicitCast(max);

        checkExpression('linear', 'input', 0, input);
        checkExpression('linear', 'min', 1, min);
        checkExpression('linear', 'max', 2, max);

        super({ input, min, max });
        this.type = 'number';

        // range mode is used only for timerange inputs:
        // * 'start' of property between full range (from start of min to end of max)
        // * 'end' of property between full range (from start of min to end of max)
        // * 'unit' (default) range mapped to 0:1
        this._rangeMode = range || 'unit';
    }

    // Given a linear value 0:1, convert it back to the input value
    // for TimeRange and Date inputs the result is an interpolated Date
    converse (value) {
        if (this.input.type === 'date') {
            const min = this.min.eval().getTime();
            const max = this.max.eval().getTime();
            return msToDate(value * (max - min) + min);
        } else if (this.input.type === 'timerange') {
            const minRange = castTimeRange(this.min.eval());
            const maxRange = castTimeRange(this.max.eval());
            if (minRange === undefined || maxRange === undefined) {
                // FIXME: it seems update event of layer can triggered
                // before metadata has been bounded.
                return null;
            }
            let min, max;
            switch (this._rangeMode) {
                case 'unit':
                    // timeRange here allows min, max to be simply iso strings
                    min = minRange.startValue;
                    max = maxRange.startValue;
                    break;
                case 'start':
                case 'end':
                    min = minRange.startValue;
                    max = maxRange.endValue;
                    break;
            }
            return TZDate.fromValue(value * (max - min) + min, minRange.timeZone);
        }
        const min = this.min.eval();
        const max = this.max.eval();
        return value * (max - min) + min;
    }

    // return min, max, but for time ranges they are returned as Dates
    limits () {
        let min, max;
        if (this.input.type === 'timerange') {
            switch (this._rangeMode) {
                case 'unit':
                    min = castTimeRange(this.min.eval()).startValue;
                    max = castTimeRange(this.max.eval()).startValue;
                    break;
                case 'start':
                case 'end':
                    min = castTimeRange(this.min.eval()).startValue;
                    max = castTimeRange(this.max.eval()).endValue;
                    break;
            }
        } else {
            min = this.min.eval();
            max = this.max.eval();
        }
        return [min, max];
    }

    eval (feature) {
        if (this.input.type === 'timerange') {
            let inputIndex;
            switch (this._rangeMode) {
                case 'unit':
                    inputIndex = 0; // start
                    break;
                case 'start':
                    inputIndex = 0; // start
                    break;
                case 'end':
                    inputIndex = 1; // end
                    break;
            }
            const input = feature._dataframe.properties[this._metadata.decodedProperties(this.input.propertyName)[inputIndex]][feature._index];

            return (input - this._internalMin) / (this._internalMax - this._internalMin);
        }

        const input = this.input.eval(feature);
        const metadata = this._metadata;
        const codec = (metadata && this.input.propertyName)
            ? metadata.codec(this.input.propertyName)
            : new IdentityCodec();
        const min = codec.externalToInternal(metadata, this.min.eval(feature));
        const max = codec.externalToInternal(metadata, this.max.eval(feature));
        const value = codec.externalToInternal(metadata, input);
        return (value - min) / (max - min);
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        this._metadata = metadata;

        if (this.input.type === 'timerange') {
            let inputIndex, min, max;
            switch (this._rangeMode) {
                case 'unit':
                    // choose same side for all three:
                    inputIndex = 0; // start
                    min = metadata.codec(this.input.propertyName).externalToInternal(metadata, this.min.eval())[inputIndex];
                    max = metadata.codec(this.input.propertyName).externalToInternal(metadata, this.max.eval())[inputIndex];
                    // min in ms is castTimeRange(this.min.eval()).startValue;
                    // max in ms is castTimeRange(this.max.eval()).startValue;
                    break;
                case 'start':
                    inputIndex = 0; // start
                    min = metadata.codec(this.input.propertyName).externalToInternal(metadata, this.min.eval())[0]; // start
                    max = metadata.codec(this.input.propertyName).externalToInternal(metadata, this.max.eval())[1]; // end
                    // min in ms is castTimeRange(this.min.eval()).startValue;
                    // max in ms is castTimeRange(this.max.eval()).endValue;
                    break;
                case 'end':
                    inputIndex = 1; // end
                    min = metadata.codec(this.input.propertyName).externalToInternal(metadata, this.min.eval())[0]; // start
                    max = metadata.codec(this.input.propertyName).externalToInternal(metadata, this.max.eval())[1]; // end
                    // min in ms is castTimeRange(this.min.eval()).startValue;
                    // max in ms is castTimeRange(this.max.eval()).endValue;
                    break;
            }

            this._internalMin = min;
            this._internalMax = max;

            this.inlineMaker = (inline) => `((${inline.input[inputIndex]}-(${min.toFixed(20)}))/(${(max - min).toFixed(20)}))`;
        } else {
            checkType('linear', 'input', 0, ['number', 'date'], this.input);
            checkType('linear', 'min', 1, ['number', 'date'], this.min);
            checkType('linear', 'max', 2, ['number', 'date'], this.max);
            // Should actually check:
            // checkType('linear', 'min', 1, this.input.type, this.min);
            // checkType('linear', 'max', 2, this.input.type, this.max);
            // but global aggregations are currently of type number even for dates

            const codec = this.input.propertyName && metadata.codec(this.input.propertyName);
            if (!codec || codec.isIdentity()) {
                // this permits using properties for the min/man expressions
                this.inlineMaker = (inline) => `((${inline.input}-${inline.min})/(${inline.max}-${inline.min}))`;
            } else {
                const smin = codec.externalToInternal(metadata, this.min.eval());
                const smax = codec.externalToInternal(metadata, this.max.eval());
                this.inlineMaker = (inline) => `((${inline.input}-(${smin.toFixed(20)}))/(${(smax - smin).toFixed(20)}))`;
            }
        }
    }

    _getLegendData (config) {
        // TODO: timerange support
        const min = this.min.eval();
        const max = this.max.eval();
        const INC = 1 / (config.samples - 1);
        const name = this.toString();
        const data = [];

        for (let i = 0; data.length < config.samples; i += INC) {
            const value = clamp(i, 0, 1);
            const key = i * (max - min) + min;

            data.push({ key, value });
        }

        return { data, min, max, name };
    }
}
