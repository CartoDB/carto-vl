import * as _ from 'lodash';

import { parseStyle } from '../core/style/parser';
// import Expression from './core/style/expressions/expression';
import CartoValidationError from './error-handling/carto-validation-error';
import * as s from '../core/style/functions';
import Expression from '../core/style/expressions/expression';


const DEFAULT_COLOR_EXPRESSION = s.rgba(0, 1, 0, 0.5);
const DEFAULT_WIDTH_EXPRESSION = s.float(5);
const DEFAULT_STROKE_COLOR_EXPRESSION = s.rgba(0, 1, 0, 0.5);
const DEFAULT_STROKE_WIDTH_EXPRESSION = s.float(0);


export default class Style {

    /**
     * Create a carto.Style.
     *
     * @param {string|object} definition - The definition of a style. This parameter could be a `string` or a `StyleSpec` object
     *
     * @example
     * new carto.Style(`
     *   color: rgb(0,0,0)
     * `);
     *
     * new carto.Style({
     *   color: carto.style.expression.rgb(0,0,0)
     * });
     *
     * @fires Error
     *
     * @constructor Style
     * @memberof carto
     * @api
     */
    constructor(definition) {
        const styleSpec = this._parseStyleDefinition(definition);
        this._checkStyleSpec(styleSpec);
        this._styleSpec = styleSpec;
    }

    getColor() {
        return this._styleSpec.color;
    }

    getWidth() {
        return this._styleSpec.width;
    }

    getStrokeColor() {
        return this._styleSpec.strokeColor;
    }

    getStrokeWidth() {
        return this._styleSpec.strokeWidth;
    }

    // TODO: Do we need this?
    // updated?
    // observer?


    /**
     * This function checks the input parameter `definition` returning always an object.
     * If the `definition` is an object it returns the same object.
     * If the `definition` is a string it returns the parsed string as an object.
     * Otherwise it throws an error.
     *
     * @param  {string|object} definition
     * @return {StyleSpec}
     */
    _parseStyleDefinition(definition) {
        if (_.isUndefined(definition)) {
            return this._setDefaults({});
        }
        if (_.isObject(definition)) {
            return this._setDefaults(definition);
        }
        if (_.isString(definition)) {
            let parsedStyle = parseStyle(definition);
            return this._setDefaults({
                color: parsedStyle.color,
                width: parsedStyle.width,
                strokeColor: parsedStyle.strokeColor,
                strokeWidth: parsedStyle.strokeWidth
            });
        }
        throw new CartoValidationError('style', 'nonValidDefinition');
    }

    // Add default values to a styleSpec object
    _setDefaults(styleSpec) {
        styleSpec.color = styleSpec.color || DEFAULT_COLOR_EXPRESSION;
        styleSpec.width = styleSpec.width || DEFAULT_WIDTH_EXPRESSION;
        styleSpec.strokeColor = styleSpec.strokeColor || DEFAULT_STROKE_COLOR_EXPRESSION;
        styleSpec.strokeWidth = styleSpec.strokeWidth || DEFAULT_STROKE_WIDTH_EXPRESSION;
        return styleSpec;
    }

    _checkStyleSpec(styleSpec) {
        /**
         * @typedef {object} StyleSpec
         * @property {carto.style.expression.Base} color
         * @property {carto.style.expression.Base} width
         * @property {carto.style.expression.Base} strokeColor
         * @property {carto.style.expression.Base} strokeWidth
         * @property {number} resolution
         * @api
         */

        // TODO: Check expression types ie: color is not a number!

        if (!(styleSpec.color instanceof Expression)) {
            throw new CartoValidationError('style', 'nonValidExpression');
        }
        if (!(styleSpec.width instanceof Expression)) {
            throw new CartoValidationError('style', 'nonValidExpression');
        }
        if (!(styleSpec.strokeColor instanceof Expression)) {
            throw new CartoValidationError('style', 'nonValidExpression');
        }
        if (!(styleSpec.strokeWidth instanceof Expression)) {
            throw new CartoValidationError('style', 'nonValidExpression');
        }
    }
}
