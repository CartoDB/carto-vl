
function _getGeomPropertiesFromPieces (pieces) {
    const geomPropertiesFromPieces = pieces.map(piece => {
        const [x, y] = piece.getRenderedCentroid();
        const aabb = piece._rawFeature._dataframe._aabb[piece._rawFeature._index];
        return { centroid: { x, y }, aabb };
    });

    const geomProperties = geomPropertiesFromPieces.filter(piece => {
        const { x, y } = piece.centroid;
        return !(isNaN(x) || isNaN(y));
    });

    return geomProperties;
}

/**
 * Get a 'compound Feature'. It is a Feature created from a set of 'feature' pieces
 * @param {Array} featurePieces
 */
export function getCompoundFeature (featurePieces) {
    const exemplar = featurePieces[0];
    if (featurePieces.length === 1) return exemplar;

    const geomProperties = _getGeomPropertiesFromPieces(featurePieces);
    Object.defineProperty(exemplar, 'getRenderedCentroid', {
        get: function () {
            const getRenderedCentroid = () => {
                // average of centroids ponderated by aabb size
                const [weightedXs, weightedYs, totalSize] = geomProperties.reduce((accumulator, currentValue) => {
                    const { minx, miny, maxx, maxy } = currentValue.aabb;
                    const size = (maxx - minx) * (maxy - miny);
                    const pX = currentValue.centroid.x * size;
                    const pY = currentValue.centroid.y * size;
                    return [accumulator[0] + pX, accumulator[1] + pY, accumulator[2] + size];
                }, [0, 0, 0]);

                return [weightedXs / totalSize, weightedYs / totalSize];
            };
            return getRenderedCentroid;
        }
    });

    return exemplar;
}
