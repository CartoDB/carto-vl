
import { average } from '../renderer/viz/expressions/stats';

/**
 * Get a 'compound Feature'. It is a Feature created from a set of 'feature' pieces
 * @param {Array} featurePieces
 */
export function getCompoundFeature (featurePieces) {
    const exemplar = featurePieces[0];
    if (featurePieces.length === 1) return exemplar;

    // Unify geometry-related properties, into an 'exemplar'.
    const allCentroids = featurePieces.map(piece => piece.getCentroid());
    const centroids = allCentroids.filter(c => {
        return !(isNaN(c[0]) || isNaN(c[1]));
    });

    Object.defineProperty(exemplar, 'getCentroid', {
        get: function () {
            const getCentroid = () => {
                const avgX = average(centroids.map(c => c[0]));
                const avgY = average(centroids.map(c => c[1]));
                return [avgX, avgY]; // vs this._rawFeature._dataframe.getCentroid(this._rawFeature._index);
            };
            return getCentroid;
        }
    });

    return exemplar;
}
