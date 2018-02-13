import Expression from './expression';
import { implicitCast } from './utils';
import { float } from '../functions';

let quantilesUID = 0;

export default class Quantiles extends Expression {
    constructor(input, buckets) {
        if (!Number.isFinite(buckets)) {
            throw new Error('Quantiles() only accepts a fixed number of buckets');
        }
        let children = {
            input
        };
        let breakpoints = [];
        for (let i = 0; i < buckets - 1; i++) {
            children[`arg${i}`] = float(i * 10);
            breakpoints.push(children[`arg${i}`]);
        }
        super(children);
        this.quantilesUID = quantilesUID++;
        this.numCategories = buckets;
        this.buckets = buckets;
        this.breakpoints = breakpoints;
    }
    _compile(metadata) {
        super._compile(metadata);
        this.type = 'category';
    }
    _getDrawMetadataRequirements() {
        return { columns: [this.input.name] };
    }
    _applyToShaderSource(uniformIDMaker, propertyTIDMaker) {
        const childSources = this.childrenNames.map(name => this[name]._applyToShaderSource(uniformIDMaker, propertyTIDMaker));
        let childInlines = {};
        childSources.map((source, index) => childInlines[this.childrenNames[index]] = source.inline);
        const funcName = `quantiles${this.quantilesUID}`;
        const elif = (_, index) =>
            `${index > 0 ? 'else' : ''} if (x<(${childInlines[`arg${index}`]})){
            return ${index + 1}.;
        }`;
        const funcBody = this.breakpoints.map(elif).join('');
        const preface = `float ${funcName}(float x){
        ${funcBody}
        return 0.;
    }`;
        return {
            preface: childSources.map(s => s.preface).reduce((a, b) => a + b, '') + preface,
            inline: `${funcName}(${childInlines.input})`
        };
    }
    _preDraw(drawMetadata, gl) {
        const column = drawMetadata.columns.find(c => c.name == this.input.name);
        let i = 0;
        const total = column.accumHistogram[999];
        const r = Math.random();
        let brs = [];
        this.breakpoints.map((breakpoint, index) => {
            for (i; i < 1000; i++) {
                if (column.accumHistogram[i] >= (index + 1) / this.buckets * total) {
                    break;
                }
            }
            const br = i / 1000 * (column.max - column.min) + column.min;
            brs.push(br);
            breakpoint.expr = br;
        });
        if (r > 0.99) {
            console.log(brs, column.min);
        }
        super._preDraw(drawMetadata, gl);
    }
}