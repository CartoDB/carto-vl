export default class ViewportFeature {
    constructor(feature, properties, metadata) {
        this._feature = feature;
        this._properties = properties;
        this._metadata = metadata;

        this._setProperties();
    }

    _setProperties() {
        this._properties.forEach((name) => {
            Object.defineProperty(this.prototype, name, {
                get: this._metadata.properties[name].type === 'category'
                    ? () => this._feature[name]
                    : () => this.metadata.IDToCategory.get(this._feature[name])
            });
        });
    }
}
