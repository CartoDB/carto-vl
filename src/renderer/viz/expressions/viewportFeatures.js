import BaseExpression from './base';
import * as schema from '../../../renderer/schema';
import Property from './basic/property';

/**
 * Generates a list of features in the viewport
 *
 * For each feature, the properties specified as arguments to this expression will be available.
 * Filtered features will not be present in the list.
 * This expression cannot be used in the visualization, it can only be used in JavaScript code as in the example below.
 *
 * @param {...Property} properties - properties that will appear in the feature list
 * @return {ViewportFeatures} ViewportFeatures
 *
 * @example <caption>Define and use a list of features. (String)</caption>
 * const source = carto.source.Dataset('data');
 * const viz = new carto.Viz(`
 *          \@list: viewportFeatures($value, $category)
 * `);
 * const layer = carto.Layer('layer', source, viz);
 * ...
 *
 * layer.on('updated', () => {
 *     viz.variables.list.value.forEach(feature => {
 *         console.log('value:', feature.value, 'category:', feature.category);
 *     });
 * });
 *
 * @memberof carto.expressions
 * @name viewportFeatures
 * @function
 * @api
 */
export default class ViewportFeatures extends BaseExpression {
    constructor(...properties) {
        if (properties.some(p => !(p instanceof Property))) {
            throw new Error('viewportFeatures arguments can only be properties');
        }

        super({});
        this.expr = [];
        this.type = 'featureList';
        this._isViewport = true;

        this._requiredProperties = properties;
    }

    _compile() {
        throw new Error('viewportFeatures cannot be used in visualizations');
    }

    _getMinimumNeededSchema() {
        return this._requiredProperties.map(p => p._getMinimumNeededSchema()).reduce(schema.union, schema.IDENTITY);
    }

    isFeatureDependent() {
        return false;
    }

    get value() {
        return this.expr;
    }

    eval() {
        return this.expr;
    }

    _resetViewportAgg(metadata) {
        this._metadata = metadata;
        this._columns = this._getMinimumNeededSchema().columns;
        this.expr = [];
    }

    accumViewportAgg(feature) {
        this.expr.push(_adaptFeature(feature, this._columns, this._metadata));
    }
}

function _adaptFeature(feature, propertyNames, metadata) {
    const adaptedFeature = {};
    for (let i = 0; i < propertyNames.length; i++) {
        const name = propertyNames[i];
        let value = feature[name];
        if (metadata.properties[name].type === 'category') {
            value = metadata.IDToCategory.get(value);
        }
        adaptedFeature[name] = value;
    }
    return adaptedFeature;
}
