import FeatureVizProperty from './featureVizProperty';

/**
 *
 * Feature objects are provided by {@link FeatureEvent} events.
 *
 * @typedef {object} Feature
 * @property {number} id - Unique identification code
 * @property {FeatureVizProperty} color
 * @property {FeatureVizProperty} width
 * @property {FeatureVizProperty} colorStroke
 * @property {FeatureVizProperty} widthStroke
 * @property {FeatureVizProperty[]} variables - Declared variables in the viz object
 * @property {function} reset - Reset custom feature vizs by fading out `duration` milliseconds, where `duration` is the first parameter to reset
 * @api
 */
export default class Feature {
    constructor (rawFeature, viz, customizedFeatures, trackFeatureViz, idProperty) {
        const variables = {};
        Object.keys(viz.variables).map(varName => {
            variables[varName] = new FeatureVizProperty(`__cartovl_variable_${varName}`, rawFeature, viz, customizedFeatures, trackFeatureViz, idProperty);
        });

        this.id = rawFeature[idProperty];
        this.color = new FeatureVizProperty('color', rawFeature, viz, customizedFeatures, trackFeatureViz, idProperty);
        this.width = new FeatureVizProperty('width', rawFeature, viz, customizedFeatures, trackFeatureViz, idProperty);
        this.strokeColor = new FeatureVizProperty('strokeColor', rawFeature, viz, customizedFeatures, trackFeatureViz, idProperty);
        this.strokeWidth = new FeatureVizProperty('strokeWidth', rawFeature, viz, customizedFeatures, trackFeatureViz, idProperty);
        this.symbol = new FeatureVizProperty('symbol', rawFeature, viz, customizedFeatures, trackFeatureViz, idProperty);
        this.symbolPlacement = new FeatureVizProperty('symbolPlacement', rawFeature, viz, customizedFeatures, trackFeatureViz, idProperty);
        this.variables = variables;
    }

    reset (duration = 500) {
        this.color.reset(duration);
        this.width.reset(duration);
        this.strokeColor.reset(duration);
        this.strokeWidth.reset(duration);
        this.symbol.reset(duration);
        this.symbolPlacement.reset(duration);

        for (let key in this.variables) {
            this.variables[key].reset(duration);
        }
    }
}
