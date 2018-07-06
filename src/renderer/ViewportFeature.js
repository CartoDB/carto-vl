export default class ViewportFeature {
    constructor(feature, properties, metadata) {
        this._feature = feature;
        this._properties = properties;
        this._metadata = metadata;

        this.setProperties();
    }

    setProperties() {
        this._properties.forEach((name) => {
            Object.defineProperty(this.prototype, name, {
                get: this._metadata.properties[name].type === 'category'
                    ? _getMetadataProperty(name).call(this)
                    : _getFeatureProperty(name).call(this)
            });
        });
    }
}

function _getFeatureProperty(name) {
    return () => this._feature[name];
}

function _getMetadataProperty(name) {
    return () => this.metadata.IDToCategory.get(this._feature[name]);
}
