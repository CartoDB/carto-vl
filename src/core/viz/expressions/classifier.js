import BaseExpression from './base';
import { number, viewportHistogram, viewportMax, viewportMin } from '../functions';
import { checkNumber, checkInstance, checkType } from './utils';
import Property from './property';
import * as schema from '../../schema';

let classifierUID = 0;


class Classifier extends BaseExpression {
    constructor(children, buckets) {
        let breakpoints = [];
        for (let i = 0; i < buckets - 1; i++) {
            children[`arg${i}`] = number(0);
            breakpoints.push(children[`arg${i}`]);
        }
        super(children);
        this.classifierUID = classifierUID++;
        this.numCategories = buckets;
        this.buckets = buckets;
        this.breakpoints = breakpoints;
        this.type = 'category';
    }
    eval(feature) {
        const input = this.input.eval(feature);
        const q = this.breakpoints.findIndex(br => input <= br);
        return q;
    }
    _genBreakpoints() {
    }
    getBreakpointList() {
        this._genBreakpoints();
        return this.breakpoints.map(br => br.expr);
    }
    _applyToShaderSource(getGLSLforProperty) {
        const childSources = this.childrenNames.map(name => this[name]._applyToShaderSource(getGLSLforProperty));
        let childInlines = {};
        childSources.map((source, index) => childInlines[this.childrenNames[index]] = source.inline);
        const funcName = `classifier${this.classifierUID}`;
        const elif = (_, index) =>
            `${index > 0 ? 'else' : ''} if (x<(${childInlines[`arg${index}`]})){
        return ${index.toFixed(2)};
    }`;
        const funcBody = this.breakpoints.map(elif).join('');
        const preface = `float ${funcName}(float x){
    ${funcBody}
    return ${this.breakpoints.length.toFixed(1)};
}`;
        return {
            preface: this._prefaceCode(childSources.map(s => s.preface).reduce((a, b) => a + b, '') + preface),
            inline: `${funcName}(${childInlines.input})`
        };
    }
    _preDraw(program, drawMetadata, gl) {
        this._genBreakpoints();
        // TODO
        super._preDraw(program, drawMetadata, gl);
    }
    _getColumnName() {
        if (this.input.aggName) {
            // Property has aggregation
            return schema.column.aggColumn(this.input.name, this.input.aggName);
        }
        return this.input.name;
    }
}


/**
 * Classify `input` by using the quantiles method with `n` buckets.
 *
 * It will classify the input based on the filtered dataset, filtering by viewport and by `filter`.
 *
 * @param {carto.expressions.Base} input - The input expression used in the quantiles
 * @param {number} n - Number of buckets to be returned
 * @return {carto.expressions.Base}
 *
 * @example <caption>Use viewportQuantiles to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.viewportQuantiles(s.prop('density'), 5), s.palettes.PRISM)
 * });
 *
 * @example <caption>Use viewportQuantiles to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(viewportQuantiles($density, 5), PRISM)
 * `);
 *
 * @memberof carto.expressions
 * @name quantiles
 * @function
 * @api
 */
export class ViewportQuantiles extends Classifier {
    constructor(input, buckets) {
        checkInstance('viewportQuantiles', 'input', 0, Property, input && (input.property || input));
        checkNumber('viewportQuantiles', 'buckets', 1, buckets);

        let children = {
            input
        };
        children._histogram = viewportHistogram(input);
        super(children, buckets);
    }
    _compile(metadata) {
        super._compile(metadata);
        checkType('viewportQuantiles', 'input', 0, 'number', this.input);
    }
    _genBreakpoints() {
        const hist = this._histogram.eval();

        const histogramBuckets = hist.length;
        const min = hist[0].x[0];
        const max = hist[histogramBuckets - 1].x[1];

        let prev = 0;
        const accumHistogram = hist.map(({ y }) => {
            prev += y;
            return prev;
        });

        let i = 0;
        const total = accumHistogram[histogramBuckets - 1];
        let brs = [];
        // TODO OPT: this could be faster with binary search
        this.breakpoints.map((breakpoint, index) => {
            for (i; i < histogramBuckets; i++) {
                if (accumHistogram[i] > (index + 1) / this.buckets * total) {
                    break;
                }
            }
            const percentileValue = i / histogramBuckets * (max - min) + min;
            brs.push(percentileValue);
            breakpoint.expr = percentileValue;
        });
    }
}

/**
 * Classify `input` by using the quantiles method with `n` buckets.
 *
 * It will classify the input based on the entire dataset without filtering by viewport or by `filter`.
 *
 * @param {carto.expressions.Base} input - The input expression used in the quantiles
 * @param {number} n - Number of buckets to be returned
 * @return {carto.expressions.Base}
 *
 * @example <caption>Use global quantiles to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.globalQuantiles(s.prop('density'), 5), s.palettes.PRISM)
 * });
 *
 * @example <caption>Use global quantiles to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(globalQuantiles($density, 5), PRISM)
 * `);
 *
 * @memberof carto.expressions
 * @name globalQuantiles
 * @function
 * @api
 */
export class GlobalQuantiles extends Classifier {
    constructor(input, buckets) {
        checkInstance('globalQuantiles', 'input', 0, Property, input && (input.property || input));
        checkNumber('globalQuantiles', 'buckets', 1, buckets);
        super({ input }, buckets);
    }
    _compile(metadata) {
        super._compile(metadata);
        checkType('globalQuantiles', 'input', 0, 'number', this.input);
        const copy = metadata.sample.map(s => s[this.input.name]);
        copy.sort((x, y) => x - y);
        this.breakpoints.map((breakpoint, index) => {
            const p = (index + 1) / this.buckets;
            breakpoint.expr = copy[Math.floor(p * copy.length)];
        });
    }
}

/**
 * Classify `input` by using the equal intervals method with `n` buckets.
 *
 * It will classify the input based on the entire dataset without filtering by viewport or by `filter`.
 *
 * @param {carto.expressions.Base} input - The input expression to classify
 * @param {number} n - Number of buckets
 * @return {carto.expressions.Base}
 *
 * @example <caption>Use global equal intervals to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.globalEqIntervals(s.prop('density'), 5), s.palettes.PRISM)
 * });
 *
 * @example <caption>Use global equal intervals to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(globalEqIntervals($density, 5), PRISM)
 * `);
 *
 * @memberof carto.expressions
 * @name globalEqIntervals
 * @function
 * @api
 */
export class GlobalEqIntervals extends Classifier {
    constructor(input, buckets) {
        checkInstance('globalEqIntervals', 'input', 0, Property, input && (input.property || input));
        checkNumber('globalEqIntervals', 'buckets', 1, buckets);
        super({ input }, buckets);
    }
    _compile(metadata) {
        super._compile(metadata);
        checkType('globalEqIntervals', 'input', 0, 'number', this.input);
        const { min, max } = metadata.columns.find(c => c.name == this.input.name);

        this.breakpoints.map((breakpoint, index) => {
            const p = (index + 1) / this.buckets;
            breakpoint.expr = min + (max - min) * p;
        });
    }
}

/**
 * Classify `input` by using the equal intervals method with `n` buckets.
 *
 * It will classify the input based on the filtered dataset, filtering by viewport and by `filter`.
 *
 * @param {carto.expressions.Base} input - The input expression to classify
 * @param {number} n - Number of buckets
 * @return {carto.expressions.Base}
 *
 * @example <caption>Use viewport equal intervals to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.viewportEqIntervals(s.prop('density'), 5), s.palettes.PRISM)
 * });
 *
 * @example <caption>Use viewport equal intervals to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(viewportEqIntervals($density, 5), PRISM)
 * `);
 *
 * @memberof carto.expressions
 * @name viewportEqIntervals
 * @function
 * @api
 */
export class ViewportEqIntervals extends Classifier {
    constructor(input, buckets) {
        checkInstance('viewportEqIntervals', 'input', 0, Property, input && (input.property || input));
        checkNumber('viewportEqIntervals', 'buckets', 1, buckets);
        let children = {
            input
        };
        children._min = viewportMin(input);
        children._max = viewportMax(input);
        super(children, buckets);
    }
    _compile(metadata) {
        super._compile(metadata);
        checkType('viewportEqIntervals', 'input', 0, 'number', this.input);
    }
    _genBreakpoints() {
        const min = this._min.eval();
        const max = this._max.eval();

        this.breakpoints.map((breakpoint, index) => {
            const p = (index + 1) / this.buckets;
            breakpoint.expr = min + (max - min) * p;
        });
    }
}
