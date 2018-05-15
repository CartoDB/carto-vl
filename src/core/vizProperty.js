import { blend, property, animate, notEquals } from './viz/functions';
import { parseVizExpression } from './viz/parser';

/**
 *
 * FeatureVizProperty objects can be accessed through {@link Feature} objects.
 *
 * @typedef {object} FeatureVizProperty
 * @property {function} blendTo - Change the feature viz by blending to a destination viz expression `expr` in `duration` milliseconds, where `expr` is the first parameter and `duration` the last one
 * @property {function} reset - Reset custom feature viz property by fading out `duration` milliseconds, where `duration` is the first parameter to reset
 * @property {function} value - Getter that evaluates the property and returns the computed value
 * @api
 */
export class VizProperty {
    get value() {
        return this._viz[this._propertyName].eval(this._properties);
    }

    constructor(propertyName, feature, viz, customizedFeatures, trackFeatureViz) {
        this._propertyName = propertyName;
        this._feature = feature;
        this._viz = viz;
        this._properties = this._feature.properties;

        this.blendTo = generateBlenderFunction(propertyName, feature, customizedFeatures, viz, trackFeatureViz);
        this.reset = generateResetFunction(propertyName, feature, customizedFeatures, viz);
    }
}

export function generateResetFunction(propertyName, feature, customizedFeatures, viz) {
    return function reset(duration = 500) {
        if (customizedFeatures[feature.id] && customizedFeatures[feature.id][propertyName]) {
            customizedFeatures[feature.id][propertyName].replaceChild(
                customizedFeatures[feature.id][propertyName].mix,
                // animate(0) is used to ensure that blend._predraw() "GC" collects it
                blend(notEquals(property('cartodb_id'), feature.id), animate(0), animate(duration))
            );
            viz[propertyName].notify();
            customizedFeatures[feature.id][propertyName] = undefined;
        }
    };
}


function generateBlenderFunction(propertyName, feature, customizedFeatures, viz, trackFeatureViz) {
    return function generatedBlendTo(newExpression, duration = 500) {
        if (typeof newExpression == 'string') {
            newExpression = parseVizExpression(newExpression);
        }
        if (customizedFeatures[feature.id] && customizedFeatures[feature.id][propertyName]) {
            customizedFeatures[feature.id][propertyName].a.blendTo(newExpression, duration);
            return;
        }
        const blendExpr = blend(
            newExpression,
            viz[propertyName],
            blend(1, notEquals(property('cartodb_id'), feature.id), animate(duration))
        );
        trackFeatureViz(feature.id, propertyName, blendExpr, customizedFeatures);
        viz.replaceChild(
            viz[propertyName],
            blendExpr,
        );
        viz[propertyName].notify();
    };
}
