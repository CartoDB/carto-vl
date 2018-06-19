
export function extendMetadata(metadata) {
    if (metadata.categorizeString) {
        return metadata;
    }
    metadata.categoryToID = new Map();
    metadata.IDToCategory = new Map();
    metadata.numCategories = 0;
    metadata.categorizeString = category => {
        if (category === undefined) {
            category = null;
        }
        if (metadata.categoryToID.has(category)) {
            return metadata.categoryToID.get(category);
        }
        metadata.categoryToID.set(category, metadata.numCategories);
        metadata.IDToCategory.set(metadata.numCategories, category);
        metadata.numCategories++;
        return metadata.numCategories - 1;
    };
    return metadata;
}
