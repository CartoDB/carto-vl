import Expression from './expression';
import { implicitCast } from './utils';

let bucketUID = 0;

export default class Buckets extends Expression {
    /*
        If input is numeric => args is a breakpoint list
        If input is categorical => args is a list of category names to map input
    */
    constructor(input, ...args) {
        args = args.map(implicitCast);
        let children = {
            input
        };
        args.map((arg, index) => children[`arg${index}`] = arg);
        super(children);
        this.bucketUID = bucketUID++;
        this.numCategories = args.length + 1;
        this.args = args;
    }
    _compile(metadata) {
        super._compile(metadata);
        this.type = 'category';
        this.othersBucket = this.input.type == 'category';
        this.args.map(breakpoint => {
            if (breakpoint.type != this.input.type) {
                throw new Error('Buckets() argument types mismatch');
            }
        });
    }
    _applyToShaderSource(uniformIDMaker, propertyTIDMaker) {
        const childSources = this.childrenNames.map(name => this[name]._applyToShaderSource(uniformIDMaker, propertyTIDMaker));
        let childInlines = {};
        childSources.map((source, index) => childInlines[this.childrenNames[index]] = source.inline);
        const funcName = `buckets${this.bucketUID}`;
        const cmp = this.input.type == 'category' ? '==' : '<';
        const elif = (_, index) =>
            `${index > 0 ? 'else' : ''} if (x${cmp}(${childInlines[`arg${index}`]})){
                return ${index}.;
            }`;
        const funcBody = this.args.map(elif).join('');
        const preface = `float ${funcName}(float x){
            ${funcBody}
            return ${this.numCategories - 1}.;
        }`;

        return {
            preface: childSources.map(s => s.preface).reduce((a, b) => a + b, '') + preface,
            inline: `${funcName}(${childInlines.input})`
        };
    }
    eval(feature) {
        const v = this.input.eval(feature);
        let i;
        for (i = 0; i < this.args.length; i++) {
            if (this.input.type == 'category' && v == this.args[i].eval(feature)) {
                return i;
            } else if (this.input.type == 'float' && v < this.args[i].eval(feature)) {
                return i;
            }
        }
        return i;
    }
}
