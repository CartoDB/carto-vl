import { generateBlenderFunction, generateResetFunction } from './blendUtils';
import { parseVizExpression } from '../renderer/viz/parser';

/**
 *
 * FeatureVizProperty objects can be accessed through {@link Feature} objects.
 *
 * @typedef {Object} FeatureVizProperty
 * @property {function} blendTo - Change the feature viz by blending to a destination viz expression `expr` in `duration` milliseconds, where `expr` is the first parameter and `duration` the last one
 * @property {function} reset - Reset custom feature viz property by fading out `duration` milliseconds, where `duration` is the first parameter to reset
 * @property {function} value - Getter that evaluates the property and returns the computed value
 * @api
 */
export default class FeatureVizProperty {
    constructor (propertyName, feature, viz, customizedFeatures, trackFeatureViz, idProperty) {
        this._propertyName = propertyName;
        this._properties = feature;
        this._viz = viz;

        this.blendTo = generateBlenderFunction(propertyName, feature[idProperty], customizedFeatures, viz, trackFeatureViz, idProperty, parseVizExpression);
        this.reset = generateResetFunction(propertyName, feature[idProperty], customizedFeatures, viz, idProperty);
    }

    get value () {
        return this._viz[this._propertyName].eval(this._properties);
    }
}
