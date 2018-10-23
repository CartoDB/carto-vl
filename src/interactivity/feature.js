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
 * @property {FeatureVizProperty} symbol
 * @property {FeatureVizProperty} symbolPlacement
 * @property {FeatureVizProperty[]} variables - Declared variables in the viz object
 * @property {function} reset - Reset custom feature vizs by fading out `duration` milliseconds, where `duration` is the first parameter to reset
 * @api
 */

export const FEATURE_VIZ_PROPERTIES = ['color', 'width', 'strokeColor', 'strokeWidth', 'symbol', 'symbolPlacement'];

export default class Feature {
    constructor (rawFeature, viz, customizedFeatures, trackFeatureViz, idProperty) {
        this.id = rawFeature[idProperty];

        this._featureVizParams = { rawFeature, viz, customizedFeatures, trackFeatureViz, idProperty };
        this._defineFeatureVizProperties();
        this._defineVariables(viz.variables);
    }

    _defineFeatureVizProperties () {
        FEATURE_VIZ_PROPERTIES.forEach((property) => {
            this[property] = this._buildFeatureVizProperty(property);
        });
    }

    _buildFeatureVizProperty (name) {
        const { rawFeature, viz, customizedFeatures, trackFeatureViz, idProperty } = this._featureVizParams;
        return new FeatureVizProperty(name, rawFeature, viz, customizedFeatures, trackFeatureViz, idProperty);
    }

    _defineVariables (vizVariables) {
        const variables = {};
        Object.keys(vizVariables).map(varName => {
            const name = `__cartovl_variable_${varName}`;
            variables[varName] = this._buildFeatureVizProperty(name);
        });
        this.variables = variables;
    }

    reset (duration = 500) {
        FEATURE_VIZ_PROPERTIES.forEach((property) => {
            this[property].reset(duration);
        });

        for (let key in this.variables) {
            this.variables[key].reset(duration);
        }
    }
}
