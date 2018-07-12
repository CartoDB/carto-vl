export default class ViewportFeature {
    constructor(feature, properties) {
        this._feature = feature;
        this._setProperties(properties);
    }

    _setProperties(properties) {
        properties.forEach((name) => {
            Object.defineProperty(this, name, {
                get: () => this._feature[name]
            });
        });
    }
}
