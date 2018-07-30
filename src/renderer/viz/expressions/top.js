import BaseExpression from './base';
import { checkType, checkLooseType, implicitCast, checkFeatureIndependent, checkInstance } from './utils';
import Property from './basic/property';
import { number } from '../expressions';

/**
 * Get the top `n` properties, aggregating the rest into an "others" bucket category.
 *
 * @param {Category} property - Column of the table
 * @param {number} n - Number of top properties to be returned
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
        buckets = implicitCast(buckets);
        checkInstance('top', 'property', 0, Property, property);
        checkLooseType('top', 'buckets', 1, 'number', buckets);
        checkFeatureIndependent('top', 'buckets', 1, buckets);
        const children = { property, buckets };
        for (let i = 0; i < 8; i++) {
            children[`_top${i}`] = number(0);
        }
        super(children);
        this.type = 'category';
    }
    eval (feature) {
        const p = this.property.eval(feature);
        const buckets = Math.round(this.buckets.eval());
        const metaColumn = this._meta.properties[this.property.name];
        const orderedCategoryNames = [...metaColumn.categories].sort((a, b) =>
            b.frequency - a.frequency
        );

        let ret;
        orderedCategoryNames.map((name, i) => {
            if (i === p) {
                ret = i < buckets ? i + 1 : 0;
            }
        });
        return ret;
    }
    _compile (metadata) {
        checkFeatureIndependent('top', 'buckets', 1, this.buckets);
        super._compile(metadata);
        checkType('top', 'property', 0, 'category', this.property);
        checkType('top', 'buckets', 1, 'number', this.buckets);
        this._meta = metadata;
        this._textureBuckets = null;
    }
    get numCategories () {
        return Math.round(this.buckets.eval()) + 1;
    }
    _applyToShaderSource (getGLSLforProperty) {
        const childSources = {};
        this.childrenNames.forEach(name => { childSources[name] = this[name]._applyToShaderSource(getGLSLforProperty); });
        return {
            preface: this._prefaceCode(Object.values(childSources).map(s => s.preface).reduce((a, b) => a + b, '') + `
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
                }
                return r;
            }`),
            inline: `top${this._uid}(${childSources.property.inline})`
        };
    }
    _postShaderCompile (program, gl) {
        super._postShaderCompile(program, gl);

        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        this.property._postShaderCompile(program);
        this._getBinding(program)._texLoc = gl.getUniformLocation(program, `topMap${this._uid}`);
    }
    _preDraw (program, drawMetadata, gl) {
        super._preDraw(program, drawMetadata, gl);
        let buckets = Math.round(this.buckets.eval());
        if (buckets > this.property.numCategories) {
            buckets = this.property.numCategories;
        }
        const metaColumn = this._meta.properties[this.property.name];

        const orderedCategoryNames = [...metaColumn.categories].sort((a, b) =>
            b.frequency - a.frequency
        );

        orderedCategoryNames.map((cat, i) => {
            if (i < buckets) {
                this[`_top${i}`].expr = (i + 1);
            }
        });
    }
    // TODO _free
}
