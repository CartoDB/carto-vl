import BaseExpression from './base';
import { checkExpression, implicitCast, checkType, checkMaxArguments, clamp } from './utils';
import { globalMin, globalMax } from '../expressions';
import { timeRange } from '../../../utils/util';
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
        if (this.input.type === 'timerange') {
            // range modes:
            // * 'start' of property between full range (from start of min to end of max)
            // * 'end' of property between full range (from start of min to end of max)
            // * 'unit' (default) range mapped to 0:1
            this._rangeMode = range || 'unit';
        }
    }



    eval (feature) {
        if (this.input.type === 'date') {
            const input = this.input.eval(feature);

            const min = this.min.eval().getTime(); // time(this.min.eval()).getTime()
            const max = this.max.eval().getTime();

            // TODO: we should use metadata.encode, right? but date is an exception
            // because stats are kept in Date form
            // FIXME: const smin = metadata.encode(this.input.propertyName, min/1000); ...
            const metadata = this._metadata;
            const inputMin = metadata.properties[this.input.name].min.getTime(); // FIXME use metadata.stats ...
            const inputMax = metadata.properties[this.input.name].max.getTime();
            const inputDiff = inputMax - inputMin;

            const smin = (min - inputMin) / inputDiff;
            const smax = (max - inputMin) / inputDiff;
            return (input - smin) / (smax - smin);
        } else if (this.input.type === 'timerange') {
            let input, min, max;
            switch (this._rangeMode) {
                case 'unit':
                    // choose same side for all three:
                    input = this.input.eval(feature).startValue;
                    min = timeRange(this.min.eval()).startValue;
                    max = timeRange(this.max.eval()).startValue;
                    break;
                case 'start':
                    input = this.input.eval(feature).startValue;
                    min = timeRange(this.min.eval()).startValue;
                    max = timeRange(this.max.eval()).endValue;
                    break;
                case 'end':
                    input = this.input.eval(feature).endValue;
                    min = timeRange(this.min.eval()).startValue;
                    max = timeRange(this.max.eval()).endValue;
                    break;

            }
            return (input - min) / (max - min);
        }

        const v = this.input.eval(feature);
        const min = this.min.eval(feature);
        const max = this.max.eval(feature);

        return (v - min) / (max - min);
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);

        if (this.input.type === 'date') {
            const min = this.min.eval();
            const max = this.max.eval();

            const smin = metadata.codec(this.input.propertyName).externalTointernal(min);
            const smax = metadata.codec(this.input.propertyName).externalTointernal(max);
            this._metadata = metadata; // TODO: check this

            this.inlineMaker = (inline) => `((${inline.input}-(${smin.toFixed(20)}))/(${(smax - smin).toFixed(20)}))`;
        } else if (this.input.type === 'timerange') {
            let inputIndex, min, max;
            switch (this._rangeMode) {
                case 'unit':
                    // choose same side for all three:
                    inputIndex = 0; // start
                    min = timeRange(this.min.eval()).startValue;
                    max = timeRange(this.max.eval()).startValue;
                    break;
                case 'start':
                    inputIndex = 0; // start
                    min = timeRange(this.min.eval()).startValue;
                    max = timeRange(this.max.eval()).endValue;
                    break;
                case 'end':
                    inputIndex = 1; // end
                    min = timeRange(this.min.eval()).startValue;
                    max = timeRange(this.max.eval()).endValue;
                    break;

            }
            // const prop = metadata.decodedProperties(this.input.propertyName)[inputIndex];
            // const smin = metadata.codec(prop).externalToInternal(min);
            // const smax = metadata.codec(prop).externalToInternal(max);
            const [smin, smax] = [min, max].map(v => metadata.codec(this.input.propertyName).externalToInternal(v));
            metadata.codec(this.input.propertyName).limitsTointernal(min, max);

            this._metadata = metadata;

            this.inlineMaker = (inline) => `((${inline.input[inputIndex]}-(${smin.toFixed(20)}))/(${(smax - smin).toFixed(20)}))`;
        } else {
            checkType('linear', 'input', 0, 'number', this.input);
            checkType('linear', 'min', 1, 'number', this.min);
            checkType('linear', 'max', 2, 'number', this.max);

            this.inlineMaker = (inline) => `((${inline.input}-${inline.min})/(${inline.max}-${inline.min}))`;
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
