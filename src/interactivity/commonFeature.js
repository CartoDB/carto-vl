
import { average } from '../renderer/viz/expressions/stats';

/**
 * Get a 'compound Feature'. It is a Feature created from a set of 'feature' pieces
 * @param {Array} featurePieces
 */
export function getCompoundFeature (featurePieces) {
    if (featurePieces.length === 1) return featurePieces[0];

    const centroids = featurePieces.map(piece => piece.getCentroid());
    const exemplar = featurePieces[0];

    // Unify geometry-related properties, into an 'exemplar'.
    delete exemplar.getCentroid;
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
