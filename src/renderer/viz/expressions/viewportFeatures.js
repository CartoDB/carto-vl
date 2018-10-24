import BaseExpression from './base';
import Property from './basic/property';
import { implicitCast } from './utils';
import schema from '../../schema';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../errors/carto-validation-error';
import CartoRuntimeError from '../../../errors/carto-runtime-error';

import FEATURE_VIZ_PROPERTIES from '../utils/featureVizProperties';

/**
 * Generates a list of features in the viewport
 *
 * For each feature, the properties specified as arguments to this expression will be available.
 * Filtered features will not be present in the list.
 * This expression cannot be used for rendering, it can only be used in JavaScript code as in the example below.
 *
 * @param {...Property} properties - properties that will appear in the feature list
 * @return {ViewportFeatures} ViewportFeatures
 *
 * @example <caption>Define and use a list of features.</caption>
 * const source = carto.source.Dataset('data');
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   variables: {
 *     list: s.viewportFeatures(s.prop('value'), s.prop('category'))
 *   }
 * });
 * const layer = carto.Layer('layer', source, viz);
 * ...

 * layer.on('updated', () => {
 *   viz.variables.list.value.forEach(feature => {
 *     console.log('value:', feature.value, 'category:', feature.category);
 *   });
 * });
 *
 * @example <caption>Define and use a list of features. (String)</caption>
 * const source = carto.source.Dataset('data');
 * const viz = new carto.Viz(`
 *   \@list: viewportFeatures($value, $category)
 * `);
 * const layer = carto.Layer('layer', source, viz);
 * ...

 * layer.on('updated', () => {
 *   viz.variables.list.value.forEach(feature => {
 *     console.log('value:', feature.value, 'category:', feature.category);
 *   });
 * });
 *
 * @memberof carto.expressions
 * @name viewportFeatures
 * @function
 * @api
 */
export default class ViewportFeatures extends BaseExpression {
    constructor (...properties) {
        properties = properties.map(p => implicitCast(p));
        // TODO validate here properties don't collide with interactivity.Feature predefined props

        // We need to set all the properties as children of the expression
        // in order for variables to be resolved.
        // And as an additional bonus we don't need to define _getMinimumNeededSchema
        super(_childrenFromProperties(properties));

        this.expr = [];
        this.type = 'featureList';
        this._isViewport = true;
        this._requiredProperties = properties;
        this._propertyNames = null;
    }

    _applyToShaderSource () {
        throw new CartoRuntimeError('\'viewportFeatures\' cannot be used in visualizations.');
    }

    isFeatureDependent () {
        return false;
    }

    get value () {
        return this.expr;
    }

    eval () {
        return this.expr;
    }

    _resetViewportAgg () {
        if (!this._propertyNames) {
            if (!this._requiredProperties.every(p => (p.isA(Property)))) {
                throw new CartoValidationError(`${cvt.INCORRECT_TYPE} viewportFeatures arguments can only be properties`);
            }

            const propertyNames = Object.keys(schema.simplify(this._getMinimumNeededSchema()));
            FEATURE_VIZ_PROPERTIES.forEach((vizPropertyName) => {
                if (propertyNames.includes(vizPropertyName)) {
                    throw new CartoValidationError(`${cvt.INCORRECT_VALUE} '${vizPropertyName}' property can't be used, as it is a reserved viz property name`);
                }
            });
            this._propertyNames = propertyNames;
        }
        this.expr = [];
    }

    accumViewportAgg (interactivityFeature) {
        this._addRequiredPropertiesTo(interactivityFeature);
        this.expr.push(interactivityFeature);
    }

    _addRequiredPropertiesTo (interactivityFeature) {
        this._propertyNames.forEach((name) => {
            interactivityFeature[name] = interactivityFeature._rawFeature[name];
        });
    }
}

function _childrenFromProperties (properties) {
    let i = 0;
    const childContainer = {};
    properties.forEach(property => {
        childContainer['p' + ++i] = property;
    });
    return childContainer;
}
