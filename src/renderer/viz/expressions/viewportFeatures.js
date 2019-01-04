import BaseExpression from './base';
import Property from './basic/property';
import ClusterTimeDimension from './aggregation/cluster/ClusterTimeDimension';
import ClusterAggregation from './aggregation/cluster/ClusterAggregation';
import { implicitCast } from './utils';
import CartoValidationError, { CartoValidationTypes as cvt } from '../../../errors/carto-validation-error';
import CartoRuntimeError from '../../../errors/carto-runtime-error';
import { genLightweightFeatureClass } from '../../../interactivity/lightweightFeature';
import { average } from './stats';

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
            if (!this._requiredProperties.every(p => validProperty(p))) {
                throw new CartoValidationError(`${cvt.INCORRECT_TYPE} viewportFeatures arguments can only be properties`);
            }
            const columns = this._requiredProperties.map(p => p.propertyName);
            this._FeatureProxy = genLightweightFeatureClass(columns, renderLayer);
        }
        this.expr = [];
    }

    accumViewportAgg (featurePieces) {
        featurePieces = Array.isArray(featurePieces) ? featurePieces : [featurePieces];

        if (featurePieces.length === 1) {
            this.expr.push(new this._FeatureProxy(featurePieces[0]));
        } else {
            const compoundFeature = this._getCompoundFeatureFrom(featurePieces);
            this.expr.push(compoundFeature);
        }
    }

    _getCompoundFeatureFrom (featurePieces) {
        const pieces = featurePieces.map((piece) => { return new this._FeatureProxy(piece); });
        const centroids = pieces.map(piece => piece.getCentroid());
        const exemplar = pieces[0];

        // Unify geometry-related properties...
        delete exemplar.getCentroid;
        Object.defineProperty(exemplar, 'getCentroid', {
            get: function () {
                const getCentroid = () => {
                    const avgX = average(centroids.map(c => c[0]));
                    const avgY = average(centroids.map(c => c[1]));
                    return [avgX, avgY]; // vs this._rawFeature._dataframe.getCentroid(this._rawFeature._index);
                };
                return getCentroid;
            }
        });

        return exemplar;
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

function validProperty (property) {
    return property.isA(Property) || property.isA(ClusterAggregation) || property.isA(ClusterTimeDimension);
}
