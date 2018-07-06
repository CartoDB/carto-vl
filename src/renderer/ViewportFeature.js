export default class ViewportFeature {
    constructor(feature, properties, metadata) {
        this._feature = feature;
        this._properties = properties;
        this._metadata = metadata;

        this.setProperties();
    }

    setProperties() {
        for (let name in this._properties) {
            Object.defineProperty(this.prototype, name, {
                get: (this._metadata.properties[name].type === 'category')
                    ? getFeatureProperty(name).bind(this)
                    : getMetadataProperty(name).bind(this)
            });
        }
    }
}

function getFeatureProperty(name) {
    return () => this._feature[name];
}

function getMetadataProperty(name) {
    return () => this.metadata.IDToCategory.get(this._feature[name]);
}
