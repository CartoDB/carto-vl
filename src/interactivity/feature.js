import FeatureVizProperty from './featureVizProperty';

/**
 * @namespace Features
 * @description CARTO VL Features are objects that contain information of the visualization.
 * @api
 */

/**
 *
 * FeatureEvent objects are fired by {@link carto.Interactivity|Interactivity} objects.
 *
 * @typedef {Object} FeatureEvent
 * @property {Object} coordinates - LongLat coordinates in { lng, lat } form
 * @property {Object} position - Pixel coordinates in { x, y } form
 * @property {Feature[]} features - Array of {@link Feature}
 * @api
 */

/**
 * featureClick events are fired when the user clicks on features. The list of features behind the cursor is provided.
 *
 * @event featureClick
 * @type {FeatureEvent}
 * @api
 */

/**
 * featureClickOut events are fired when the user clicks outside a feature that was clicked in the last featureClick event.
 * The list of features that were clicked before and that are no longer behind this new click is provided.
 *
 * @event featureClickOut
 * @type {FeatureEvent}
 * @api
 */

/**
 * featureEnter events are fired when the user moves the cursor and the movement implies that a non-previously hovered feature (as reported by featureHover or featureLeave) is now under the cursor.
 * The list of features that are now behind the cursor and that weren't before is provided.
 *
 * @event featureEnter
 * @type {FeatureEvent}
 * @api
 */

/**
 * featureHover events are fired when the user moves the cursor.
 * The list of features behind the cursor is provided.
 *
 * @event featureHover
 * @type {FeatureEvent}
 * @api
 */

/**
 * featureLeave events are fired when the user moves the cursor and the movement implies that a previously hovered feature (as reported by featureHover or featureEnter) is no longer behind the cursor.
 * The list of features that are no longer behind the cursor and that were before is provided.
 *
 * @event featureLeave
 * @type {FeatureEvent}
 * @api
 */

/**
 *
 * Feature objects are provided by {@link FeatureEvent} events.
 *
 * @constructor Feature
 * @typedef {Object} Feature
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
