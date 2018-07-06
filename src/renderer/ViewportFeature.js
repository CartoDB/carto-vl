export default class ViewportFeature {
    constructor(feature, properties, metadata) {
        this._feature = feature;
        this._setProperties(properties, metadata);
    }

    _setProperties(properties, metadata) {
        properties.forEach((name) => {
            Object.defineProperty(this, name, {
                get: metadata.properties[name].type === 'category'
                    ? () => metadata.IDToCategory.get(this._feature[name])
                    : () => this._feature[name]
            });
        });
    }
}
