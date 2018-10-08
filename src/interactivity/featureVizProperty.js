import { blend, property, transition, notEquals } from '../renderer/viz/expressions';
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

        this.blendTo = _generateBlenderFunction(propertyName, feature[idProperty], customizedFeatures, viz, trackFeatureViz, idProperty);
        this.reset = _generateResetFunction(propertyName, feature[idProperty], customizedFeatures, viz, idProperty);
    }

    get value () {
        return this._viz[this._propertyName].eval(this._properties);
    }
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

function _generateBlenderFunction (propertyName, id, customizedFeatures, viz, trackFeatureViz, idProperty) {
    return function generatedBlendTo (newExpression, duration = 500) {
        if (typeof newExpression === 'string') {
            newExpression = parseVizExpression(newExpression);
        }
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
