/**
 * Function to create dynamically a ViewportFeature class, with the proper getters
 * to access its properties, as declared in the `metadata`
 */
export function genViewportFeatureClass (metadata) {
    const classTemplate = class ViewportFeature {
        constructor (index, dataframe) {
            this._index = index;
            this._dataframe = dataframe;
        }
    };
    Object.defineProperties(classTemplate.prototype, buildGettersFrom(metadata));

    return classTemplate;
}

function buildGettersFrom (metadata) {
    const getters = {};
    metadata.propertyKeys.forEach(propertyName => {
        const codec = metadata.codec(propertyName);
        if (codec.isRange()) {
            const decodedProperties = metadata.decodedProperties(propertyName);
            getters[propertyName] = {
                get: function () {
                    const index = this._index;
                    const args = decodedProperties.map(name => this._dataframe.properties[name][index]);
                    return codec.internalToExternal(metadata, args);
                }
            };
        } else {
            getters[propertyName] = {
                get: function () {
                    const index = this._index;
                    const value = this._dataframe.properties[propertyName][index];
                    return codec.internalToExternal(metadata, value);
                }
            };
        }
    });
    return getters;
}
