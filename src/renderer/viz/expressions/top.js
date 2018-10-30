import BaseExpression from './base';
import { checkType, implicitCast, checkFeatureIndependent, checkInstance, checkMaxArguments } from './utils';
import Property from './basic/property';
import { number } from '../expressions';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../errors/carto-validation-error';
import { OTHERS_INDEX, OTHERS_GLSL_VALUE, OTHERS_LABEL } from './constants';

// Careful! This constant must match with the shader code of the Top expression
const MAX_TOP_BUCKETS = 16;

/**
 * Get the top `n` properties, aggregating the rest into an "others" bucket category.
 *
 * @param {Category} property - Column of the table
 * @param {number} n - Number of top properties to be returned, the maximum value is 16, values higher than that will result in an error
 * @return {Category}
 *
 * @example <caption>Use top 3 categories to define a color ramp.</caption>
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   color: s.ramp(s.top(s.prop('category'), 3), s.palettes.VIVID)
 * });
 *
 * @example <caption>Use top 3 categories to define a color ramp. (String)</caption>
 * const viz = new carto.Viz(`
 *   color: ramp(top($category, 3), VIVID)
 * `);
 *
 * @memberof carto.expressions
 * @name top
 * @function
 * @api
 */
export default class Top extends BaseExpression {
    constructor (property, buckets) {
        checkMaxArguments(arguments, 2, 'top');

        buckets = implicitCast(buckets);
        const children = { property, buckets };
        for (let i = 0; i < MAX_TOP_BUCKETS; i++) {
            children[`_top${i}`] = number(0);
        }
        super(children);
        this.type = 'category';
    }

    eval (feature) {
        const metaColumn = this._metadata.properties[this.property.name];
        const orderedCategoryNames = [...metaColumn.categories].sort((a, b) =>
            b.frequency - a.frequency
        );
        const categoryName = this.property.eval(feature);
        const index = orderedCategoryNames.findIndex(category => category.name === categoryName);
        const divisor = this.numCategoriesWithoutOthers - 1 || 1;

        return index >= this.numBuckets || index === -1 ? OTHERS_INDEX : index / divisor;
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);

        checkInstance('top', 'property', 0, Property, this.property);
        checkType('top', 'property', 0, 'category', this.property);
        checkFeatureIndependent('top', 'buckets', 1, this.buckets);
        checkType('top', 'buckets', 1, 'number', this.buckets);

        this._metadata = metadata;
        this._textureBuckets = null;
    }

    get numCategories () {
        return this.numBuckets + 1;
    }

    get numCategoriesWithoutOthers () {
        return this.numCategories - 1;
    }

    get numBuckets () {
        let buckets = Math.round(this.buckets.eval());

        if (buckets > this.property.numCategories) {
            buckets = this.property.numCategories;
        }

        if (buckets > MAX_TOP_BUCKETS) {
            // setTimeout is used here because throwing within the renderer stack leaves the state in an invalid state,
            // making this error an unrecoverable error, within the setTimeout the error is recoverable
            const prev = this.buckets.eval();
            setTimeout(() => {
                throw new CartoValidationError(
                    `${cvt.INCORRECT_VALUE} top() function has a limit of ${MAX_TOP_BUCKETS} buckets but '${prev}' buckets were specified.`
                );
            });
            buckets = 0;
        }

        return buckets;
    }

    _applyToShaderSource (getGLSLforProperty) {
        const childSources = {};
        this.childrenNames.forEach(name => { childSources[name] = this[name]._applyToShaderSource(getGLSLforProperty); });
        return {
            preface: this._prefaceCode(Object.values(childSources).map(s => s.preface).join('') + `
            uniform float numCategoriesWithoutOthers${this._uid};

            float top${this._uid}(float id){
                float r;
                if (${childSources._top0.inline} == id){
                    r = 0.;
                } else if (${childSources._top1.inline} == id){
                    r = 1.;
                } else if (${childSources._top2.inline} == id){
                    r = 2.;
                } else if (${childSources._top3.inline} == id){
                    r = 3.;
                } else if (${childSources._top4.inline} == id){
                    r = 4.;
                } else if (${childSources._top5.inline} == id){
                    r = 5.;
                } else if (${childSources._top6.inline} == id){
                    r = 6.;
                } else if (${childSources._top7.inline} == id){
                    r = 7.;
                } else if (${childSources._top8.inline} == id){
                    r = 8.;
                } else if (${childSources._top9.inline} == id){
                    r = 9.;
                } else if (${childSources._top10.inline} == id){
                    r = 10.;
                } else if (${childSources._top11.inline} == id){
                    r = 11.;
                } else if (${childSources._top12.inline} == id){
                    r = 12.;
                } else if (${childSources._top13.inline} == id){
                    r = 13.;
                } else if (${childSources._top14.inline} == id){
                    r = 14.;
                } else if (${childSources._top15.inline} == id){
                    r = 15.;
                }else{
                    return ${OTHERS_GLSL_VALUE};
                }
                return r/(numCategoriesWithoutOthers${this._uid}-1.);
            }`),
            inline: `top${this._uid}(${childSources.property.inline})`
        };
    }

    _postShaderCompile (program, gl) {
        this._numCategoriesLoc = gl.getUniformLocation(program, `numCategoriesWithoutOthers${this._uid}`);
        super._postShaderCompile(program, gl);
    }

    _preDraw (program, drawMetadata, gl) {
        const buckets = this.numBuckets;
        const metaColumn = this._metadata.properties[this.property.name];

        const orderedCategoryNames = [...metaColumn.categories].sort((a, b) =>
            b.frequency - a.frequency
        );

        for (let i = 0; i < MAX_TOP_BUCKETS; i++) {
            this[`_top${i}`].expr = Number.POSITIVE_INFINITY;
        }

        orderedCategoryNames.forEach((cat, i) => {
            if (i < buckets) {
                this[`_top${i}`].expr = this._metadata.categoryToID.get(cat.name);
            }
        });

        gl.uniform1f(this._numCategoriesLoc, this.numCategoriesWithoutOthers);
        super._preDraw(program, drawMetadata, gl);
    }

    _getLegendData () {
        const metaColumn = this._metadata.properties[this.property.name];
        const orderedCategoryNames = [...metaColumn.categories].sort((a, b) =>
            b.frequency - a.frequency
        );
        const buckets = this.numBuckets;
        const data = [];
        const name = this.toString();
        const divisor = this.numCategoriesWithoutOthers - 1 || 1;
        orderedCategoryNames.forEach((category, i) => {
            if (i < buckets) {
                const key = category.name;
                const value = i / divisor;
                data.push({ key, value });
            }
        });

        data.push({
            key: OTHERS_LABEL,
            value: OTHERS_INDEX
        });

        return { name, data };
    }
}
