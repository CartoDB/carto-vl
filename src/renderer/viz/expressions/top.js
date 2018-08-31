import BaseExpression from './base';
import { checkType, implicitCast, checkFeatureIndependent, checkInstance, checkMaxArguments } from './utils';
import Property from './basic/property';
import { number } from '../expressions';

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
        checkInstance('top', 'property', 0, Property, property);
        checkFeatureIndependent('top', 'buckets', 1, buckets);
        const children = { property, buckets };
        for (let i = 0; i < MAX_TOP_BUCKETS; i++) {
            children[`_top${i}`] = number(0);
        }
        super(children);
        this.type = 'category';
    }
    eval (feature) {
        const catID = this._meta.categoryToID.get(this.property.eval(feature));
        const buckets = this.numBuckets;
        const metaColumn = this._meta.properties[this.property.name];
        const orderedCategoryNames = [...metaColumn.categories].sort((a, b) =>
            b.frequency - a.frequency
        );

        let ret;
        orderedCategoryNames.map((name, i) => {
            if (i === catID) {
                ret = i < buckets ? this._meta.IDToCategory.get(i) : 'CARTOVL_TOP_OTHERS_BUCKET';
            }
        });
        return ret;
    }

    _bindMetadata (metadata) {
        checkFeatureIndependent('top', 'buckets', 1, this.buckets);

        super._bindMetadata(metadata);

        checkType('top', 'property', 0, 'category', this.property);
        checkType('top', 'buckets', 1, 'number', this.buckets);

        this._meta = metadata;
        this._textureBuckets = null;
    }

    get numCategories () {
        return this.numBuckets + 1;
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
                throw new Error(`top() function has a limit of ${MAX_TOP_BUCKETS} buckets but '${prev}' buckets were specified`);
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
            float top${this._uid}(float id){
                float r = 0.;
                if (${childSources._top0.inline} == id){
                    r = 1.;
                } else if (${childSources._top1.inline} == id){
                    r = 2.;
                } else if (${childSources._top2.inline} == id){
                    r = 3.;
                } else if (${childSources._top3.inline} == id){
                    r = 4.;
                } else if (${childSources._top4.inline} == id){
                    r = 5.;
                } else if (${childSources._top5.inline} == id){
                    r = 6.;
                } else if (${childSources._top6.inline} == id){
                    r = 7.;
                } else if (${childSources._top7.inline} == id){
                    r = 8.;
                } else if (${childSources._top8.inline} == id){
                    r = 9.;
                } else if (${childSources._top9.inline} == id){
                    r = 10.;
                } else if (${childSources._top10.inline} == id){
                    r = 11.;
                } else if (${childSources._top11.inline} == id){
                    r = 12.;
                } else if (${childSources._top12.inline} == id){
                    r = 13.;
                } else if (${childSources._top13.inline} == id){
                    r = 14.;
                } else if (${childSources._top14.inline} == id){
                    r = 15.;
                } else if (${childSources._top15.inline} == id){
                    r = 16.;
                }
                return r;
            }`),
            inline: `top${this._uid}(${childSources.property.inline})`
        };
    }
    _preDraw (program, drawMetadata, gl) {
        const buckets = this.numBuckets;
        const metaColumn = this._meta.properties[this.property.name];

        const orderedCategoryNames = [...metaColumn.categories].sort((a, b) =>
            b.frequency - a.frequency
        );

        for (let i = 0; i < MAX_TOP_BUCKETS; i++) {
            this[`_top${i}`].expr = Number.POSITIVE_INFINITY;
        }

        orderedCategoryNames.map((cat, i) => {
            if (i < buckets) {
                this[`_top${i}`].expr = (i + 1);
            }
        });

        super._preDraw(program, drawMetadata, gl);
    }
}
