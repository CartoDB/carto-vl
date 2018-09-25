import BaseExpression from './base';
import { checkExpression, implicitCast, checkType, checkMaxArguments } from './utils';

const SQRT_MAX_CATEGORIES_PER_PROPERTY = 256;

/**
* Transform a categorical property into a per-property category index. The evaluated result returns a value between 0 and 1.
* The dataset must contain less than 65536 (256 * 256) different categories.
*
* @param {Category} property - The property to be evaluated, must be categorical
* @return {Category}
*
* @example <caption> Color by $city using the CARTOColor Prism by assigning different color in Prism to each category.</caption>
* const s = carto.expressions;
* const viz = new carto.Viz({
*   color: s.ramp(s.categoryIndex(s.prop('city')), s.palettes.PRISM)
* });
*
* @example <caption> Color by $city using the CARTOColor Prism by assigning different color in Prism to each category. (String)</caption>
* const viz = new carto.Viz(`
*   color: ramp(categoryIndex($city), PRISM)
* `);
*
* @memberof carto.expressions
* @name categoryIndex
* @function
* @api
*/
export default class CategoryIndex extends BaseExpression {
    constructor (property) {
        checkMaxArguments(arguments, 1, 'categoryIndex');

        property = implicitCast(property);

        checkExpression('categoryIndex', 'property', 0, property);
        super({ property });
        this._numTranslatedCategories = null;
        this.type = 'category';

        this._translatePixels = new Float32Array(SQRT_MAX_CATEGORIES_PER_PROPERTY * SQRT_MAX_CATEGORIES_PER_PROPERTY);
        this._translateArray = [];
        this._numTranslatedCategories = 0;
        this._numTranslatedCategoriesGL = 0;
    }

    get numCategories () {
        const metaColumn = this._metadata.properties[this.property.name];
        return metaColumn.categories.length;
    }

    get numCategoriesWithoutOthers () {
        return this.numCategories;
    }

    _bindMetadata (metadata) {
        super._bindMetadata(metadata);
        checkType('categoryIndex', 'property', 0, 'category', this.property);
        this._metadata = metadata;
        this._calcTranslated();
    }

    eval (feature) {
        const name = this.property.eval(feature);
        const id = this._metadata.categoryToID.get(name);

        return this._translateArray[id];
    }

    _preDraw (program, drawMetadata, gl) {
        gl.activeTexture(gl.TEXTURE0 + drawMetadata.freeTexUnit);

        if (this._numTranslatedCategoriesGL !== this.numCategories) {
            this._numTranslatedCategoriesGL = this.numCategories;
            this._calcTranslated();
            this._translateTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this._translateTexture);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, SQRT_MAX_CATEGORIES_PER_PROPERTY, SQRT_MAX_CATEGORIES_PER_PROPERTY, 0, gl.ALPHA, gl.FLOAT, this._translatePixels);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        } else {
            gl.bindTexture(gl.TEXTURE_2D, this._translateTexture);
        }

        gl.uniform1i(this._getBinding(program).texRampTranslateLoc, drawMetadata.freeTexUnit);
        drawMetadata.freeTexUnit++;
    }

    _applyToShaderSource (getGLSLforProperty) {
        const max = SQRT_MAX_CATEGORIES_PER_PROPERTY.toFixed(20);
        const property = this.property._applyToShaderSource(getGLSLforProperty);
        return {
            inline: `ramp_translate${this._uid}(${property.inline})`,
            preface: `
                    uniform sampler2D texRampTranslate${this._uid};
                    float ramp_translate${this._uid}(float s){
                        vec2 v = vec2(mod(s, ${max}), floor(s / ${max}));
                        return texture2D(texRampTranslate${this._uid}, v/${max}).a;
                    }`
        };
    }

    _postShaderCompile (program, gl) {
        this._getBinding(program).texRampTranslateLoc = gl.getUniformLocation(program, `texRampTranslate${this._uid}`);
    }

    _calcTranslated () {
        const metaColumn = this._metadata.properties[this.property.name];
        const numCategories = this.numCategories;

        if (this._numTranslatedCategories !== numCategories) {
            this._numTranslatedCategories = numCategories;

            for (let i = 0; i < numCategories; i++) {
                const id = this._metadata.categoryToID.get(metaColumn.categories[i].name);
                const value = i / (numCategories - 1);
                const vec2Id = {
                    x: id % SQRT_MAX_CATEGORIES_PER_PROPERTY,
                    y: Math.floor(id / SQRT_MAX_CATEGORIES_PER_PROPERTY)
                };

                this._translatePixels[SQRT_MAX_CATEGORIES_PER_PROPERTY * vec2Id.y + vec2Id.x] = value;
                this._translateArray.push(value);
            }
        }
    }

    _getLegendData () {
        const categories = this._metadata.properties[this.property.name].categories;
        const categoriesLength = categories.length;
        const divisor = categoriesLength - 1;
        const data = [];

        for (let i = 0; i < categoriesLength; i++) {
            const category = categories[i];
            const key = category.name;
            const value = i / divisor;

            data.push({ key, value });
        }

        return { data };
    }
}
