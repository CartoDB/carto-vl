import BaseExpression from './base';
import Property from './basic/property';
import { implicitCast } from './utils';
import schema from '../../schema';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../errors/carto-validation-error';
import CartoRuntimeError from '../../../errors/carto-runtime-error';
import { blend, property, notEquals, transition } from '../expressions';

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

        // We need to set all the properties as children of the expression
        // in order for variables to be resolved.
        // And as an additional bonus we don't need to define _getMinimumNeededSchema
        super(_childrenFromProperties(properties));

        this.expr = [];
        this.type = 'featureList';
        this._isViewport = true;
        this._requiredProperties = properties;
        this._FeatureProxy = null;
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

    _resetViewportAgg (metadata, renderLayer) {
        if (!this._FeatureProxy) {
            if (!this._requiredProperties.every(p => (p.isA(Property)))) {
                throw new CartoValidationError(`${cvt.INCORRECT_TYPE} viewportFeatures arguments can only be properties`);
            }
            const columns = Object.keys(schema.simplify(this._getMinimumNeededSchema()));
            this._FeatureProxy = this.genViewportFeatureClass(columns, renderLayer);
        }
        this.expr = [];
    }

    accumViewportAgg (feature) {
        this.expr.push(new this._FeatureProxy(feature));
    }

    genViewportFeatureClass (properties, renderLayer) {
        const cls = class ViewportFeature {
            constructor (feature) {
                this._feature = feature;
            }
        };
        properties.forEach(prop => {
            Object.defineProperty(cls.prototype, prop, {
                get: function () {
                    return this._feature[prop];
                }
            });
        });

        const idProperty = 'cartodb_id'; // TODO use metadata id property
        // TODO 'customizedFeatures, viz, trackFeatureViz' from renderlayer
        ['color', 'width', 'strokeColor', 'strokeWidth'].forEach(prop => {
            const blender = _generateBlenderFunction(prop,
                renderLayer.customizedFeatures, renderLayer.viz, renderLayer.trackFeatureViz, idProperty);
            Object.defineProperty(cls.prototype, prop, {
                get: function () {
                    return {
                        blendTo: (...args) => blender.bind(this)(...args)
                    };
                }
            });
        });
        return cls;
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

function _generateResetFunction (propertyName, id, customizedFeatures, viz, idProperty) {
    return function reset (duration = 500) {
        if (customizedFeatures[id] && customizedFeatures[id][propertyName]) {
            customizedFeatures[id][propertyName].replaceChild(
                customizedFeatures[id][propertyName].mix,
                // transition(0) is used to ensure that blend._predraw() "GC" collects it
                blend(notEquals(property(idProperty), id), transition(0), transition(duration))
            );
            viz[propertyName].notify();
            customizedFeatures[id][propertyName] = undefined;
        }
    };
}

function _generateBlenderFunction (propertyName, customizedFeatures, viz, trackFeatureViz, idProperty) {
    return function generatedBlendTo (newExpression, duration = 500) {
        if (typeof newExpression === 'string') {
            // newExpression = parseVizExpression(newExpression);
        }
        const id = this._feature[idProperty];
        if (customizedFeatures[id] && customizedFeatures[id][propertyName]) {
            customizedFeatures[id][propertyName].a.blendTo(newExpression, duration);
            return;
        }
        const blendExpr = blend(
            newExpression,
            viz[propertyName],
            blend(1, notEquals(property(idProperty), id), transition(duration))
        );
        trackFeatureViz(id, propertyName, blendExpr, customizedFeatures);
        viz.replaceChild(
            viz[propertyName],
            blendExpr
        );
        viz[propertyName].notify();
    };
}
