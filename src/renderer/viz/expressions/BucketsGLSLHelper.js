import { OTHERS_GLSL_VALUE } from './constants';
export default class BucketsGLSLHelper {
    constructor (buckets) {
        this.buckets = buckets;
    }

    applyToShaderSource (getGLSLforProperty) {
        const childSourcesArray = this.buckets.childrenNames.map(name => this.buckets[name]._applyToShaderSource(getGLSLforProperty));
        let childSources = {};
        childSourcesArray.map((source, index) => {
            childSources[this.buckets.childrenNames[index]] = source;
        });

        const funcName = `buckets${this.buckets._uid}`;
        const cmp = this.buckets.input.type === 'category' ? '==' : '<';

        // When there is "OTHERS" we don't need to take it into account
        const divisor = this.buckets.numCategoriesWithoutOthers - 1 || 1;

        const elif = (_, index) =>
            `${index > 0 ? 'else' : ''} if (x${cmp}(${childSources.list.inline[index]})){
                return ${index}./${divisor.toFixed(20)};
            }`;
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
}
