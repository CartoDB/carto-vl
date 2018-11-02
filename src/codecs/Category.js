import BaseCodec from './Base';

export default class CategoryCodec extends BaseCodec {
    constructor (metadata, propertyName) {
        super();
        this._metadata = metadata;
        this._baseName = metadata.baseName(propertyName);
    }

    sourceToInternal (propertyValue) {
        return this._metadata.categorizeString(this._baseName, propertyValue);
    }

    internalToExternal (propertyValue) {
        return this._metadata.IDToCategory.get(propertyValue);
    }

    sourceToExternal (propertyValue) {
        return propertyValue;
    }

    externalToSource (v) {
        return v;
    }
}
