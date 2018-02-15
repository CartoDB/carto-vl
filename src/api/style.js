import * as _ from 'lodash';

import { parseStyle } from '../core/style/parser';
// import Expression from './core/style/expressions/expression';
import CartoValidationError from './error-handling/carto-validation-error';


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

    /**
     * This function checks the input parameter `definition` returning always an object.
     * If the `definition` is an object it returns the same object.
     * If the `definition` is a string it returns the parsed string as an object.
     * Otherwise it throws an error.
     *
     * @param  {string|object} definition
     * @return {object}
     */
    _parseStyleDefinition(definition) {
        if (_.isUndefined(definition)) {
            throw new CartoValidationError('style', 'definitionRequired');
        }
        if (_.isObject(definition)) {
            return definition;
        }
        if (_.isString(definition)) {
            return parseStyle(definition);
        }
        throw new CartoValidationError('style', 'nonValidDefinition');
    }

    _checkStyleSpec(/*styleSpec*/) {
        /**
        * @typedef {object} StyleSpec
        * @property {carto.style.expression.Base} color
        * @property {carto.style.expression.Base} width
        * @property {carto.style.expression.Base} strokeColor
        * @property {carto.style.expression.Base} strokeWidth
        * @property {number} resolution
        * @api
        */
        // TODO
    }
}
