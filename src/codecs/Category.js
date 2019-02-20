import BaseCodec from './Base';

export default class CategoryCodec extends BaseCodec {
    constructor (metadata, propertyName) {
        super();
        this._baseName = metadata.baseName(propertyName);
    }

    sourceToInternal (metadata, propertyValue) {
        return metadata.categorizeString(this._baseName, propertyValue);
    }

    internalToExternal (metadata, propertyValue) {
        return metadata.IDToCategory.get(propertyValue);
    }

    sourceToExternal (metadata, propertyValue) {
        return propertyValue;
    }

    externalToSource (metadata, v) {
        return v;
    }
}
