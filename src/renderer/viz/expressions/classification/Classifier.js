import BaseExpression from '../base';
import { number } from '../../expressions';

let classifierUID = 0;
export default class Classifier extends BaseExpression {
    constructor (children, buckets) {
        const breakpoints = _genBreakpoints(children, buckets);
        // TODO check buckets
        super(children);

        this.classifierUID = classifierUID++;
        this.numCategories = buckets;
        this.numCategoriesWithoutOthers = buckets;
        this.buckets = buckets;
        this.breakpoints = breakpoints;
        this.type = 'category';
    }

    toString () {
        return `${this.expressionName}(${this.input.toString()}, ${this.buckets})`;
    }

    eval (feature) {
        const input = this.input.eval(feature);
        const breakpoint = this.breakpoints.findIndex((br) => {
            return input <= br.expr;
        });

        const divisor = this.numCategories - 1 || 1;
        const index = breakpoint === -1
            ? this.breakpoints.length / divisor
            : breakpoint / divisor;

        return index;
    }

    getBreakpointList () {
        this._genBreakpoints();
        return this.breakpoints.map(br => br.expr);
    }

    _genBreakpoints () {}

    _applyToShaderSource (getGLSLforProperty) {
        const childSources = this.childrenNames.map(name => this[name]._applyToShaderSource(getGLSLforProperty));
        let childInlines = {};
        childSources.map((source, index) => {
            childInlines[this.childrenNames[index]] = source.inline;
        });
        const funcName = `classifier${this.classifierUID}`;
        const divisor = this.numCategories - 1 || 1;
        const elif = (_, index) =>
            `${index > 0 ? 'else' : ''} if (x<(${childInlines[`arg${index}`]})){
                return ${(index / divisor).toFixed(20)};
            }`;
        const funcBody = this.breakpoints.map(elif).join('');
        const preface = `float ${funcName}(float x){
            ${funcBody}
            return ${(this.breakpoints.length / divisor).toFixed(20)};
        }`;
        return {
            preface: this._prefaceCode(childSources.map(s => s.preface).reduce((a, b) => a + b, '') + preface),
            inline: `${funcName}(${childInlines.input})`
        };
    }

    _preDraw (program, drawMetadata, gl) {
        this._genBreakpoints();
        // TODO
        super._preDraw(program, drawMetadata, gl);
    }

    getLegendData () {
        const breakpoints = this.getBreakpointList();
        const breakpointsLength = breakpoints.length;
        const name = this.toString();
        const data = [];

        for (let i = 0; i <= breakpointsLength; i++) {
            const min = i - 1 >= 0 ? breakpoints[i - 1] : Number.NEGATIVE_INFINITY;
            const max = i < breakpointsLength ? breakpoints[i] : Number.POSITIVE_INFINITY;
            const key = [min, max];
            const value = i / breakpointsLength;
            data.push({key, value});
        }

        return { name, data };
    }
}

function _genBreakpoints (children, buckets) {
    const breakpoints = [];

    for (let i = 0; i < buckets - 1; i++) {
        children[`arg${i}`] = number(0);
        breakpoints.push(children[`arg${i}`]);
    }

    return breakpoints;
}
