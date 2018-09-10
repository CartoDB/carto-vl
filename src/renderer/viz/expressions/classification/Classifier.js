import BaseExpression from '../base';
import { number } from '../../expressions';

let classifierUID = 0;
export default class Classifier extends BaseExpression {
    constructor (children, buckets) {
        if (buckets <= 1) {
            throw new RangeError(`The number of 'buckets' must be >=2, but ${buckets} was used.`);
        }
        const breakpoints = _genBreakpoints(children, buckets);

        super(children);

        this.classifierUID = classifierUID++;
        this.numCategories = buckets;
        this.buckets = buckets;
        this.breakpoints = breakpoints;
        this.type = 'category';
    }

    eval (feature) {
        const NOT_FOUND_INDEX = -1;
        const input = this.input.eval(feature);
        const index = this.breakpoints.findIndex((br) => {
            return input <= br.expr;
        });

        return index === NOT_FOUND_INDEX ? this.breakpoints.length : index;
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

    _preDraw (program, drawMetadata, gl) {
        this._genBreakpoints();
        // TODO
        super._preDraw(program, drawMetadata, gl);
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
