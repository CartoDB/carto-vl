import { OTHERS_GLSL_VALUE } from './constants';

/*
    Once the number of buckets exceed 27, 'memory exhausted' problems are common at glsl compile time.
    Here we set a little lower value to keep comparisons in just one if-else-if expression.
    Beyond that value, N independent if expressions will be created.
    That's a bit more inefficient but it consumes less memory, allowing for example a bigger
    number of different icons in a viz
*/
const SAFE_NUMBER_ELSE_IF_COMPARISONS = 20;

export default class BucketsGLSLHelper {
    constructor (buckets) {
        this.buckets = buckets;
    }

    applyToShaderSource (getGLSLforProperty) {
        // Get children sources
        const childSourcesArray = this.buckets.childrenNames.map(name => this.buckets[name]._applyToShaderSource(getGLSLforProperty));
        let childSources = {};
        childSourcesArray.map((source, index) => {
            childSources[this.buckets.childrenNames[index]] = source;
        });

        // Get coode for buckets comparisons
        const funcName = `buckets${this.buckets._uid}`;
        const elif = this._getComparisons(childSources);
        const funcBody = this.buckets.list.elems.map(elif).join('');

        const preface = `float ${funcName}(float x){
            ${funcBody}
            return ${this.buckets.input.type === 'category' ? OTHERS_GLSL_VALUE : (this.buckets.numCategories - 1).toFixed(20)};
        }`;

        return {
            preface: this.buckets._prefaceCode(childSources.input.preface + childSources.list.preface + preface),
            inline: `${funcName}(${childSources.input.inline})`
        };
    }

    /**
     * Get if-expressions to compare each value with the corresponding buckets
     */
    _getComparisons (childSources) {
        const cmp = this.buckets.input.type === 'category' ? '==' : '<';

        // When there is "OTHERS" we don't need to take it into account
        const divisor = this.buckets.numCategoriesWithoutOthers - 1 || 1;

        let elif;
        if (divisor <= SAFE_NUMBER_ELSE_IF_COMPARISONS) {
            // just one expression, with one 'if' & several 'else if'
            elif = (_, index) =>
                `${index > 0 ? 'else' : ''} if (x${cmp}(${childSources.list.inline[index]})){
                return ${index}./${divisor.toFixed(20)};
            }`;
        } else {
            // multiple, independent, 'if' expressions (order is assumed)
            elif = (_, index) =>
                `if (x${cmp}(${childSources.list.inline[index]})){
                return ${index}./${divisor.toFixed(20)};
            }`;
        }
        return elif;
    }
}
