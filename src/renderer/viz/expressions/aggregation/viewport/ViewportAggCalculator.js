
import { FILTERING_THRESHOLD } from '../../../../Renderer';
import ViewportFeatures from '../../viewportFeatures';

/**
 * Run all viewport aggregation functions over the visible features in the renderLayer
 */
export function runViewportAggregations (renderLayer) {
    const viewportExpressions = _getViewportExpressions(renderLayer.viz._getRootExpressions());
    if (!viewportExpressions.length) {
        return;
    }

    _reset(viewportExpressions, renderLayer);
    _runInActiveDataframes(viewportExpressions, renderLayer);
}

/**
 * Perform a DFS (Depth First Search) through the expression tree collecting all viewport expressions.
 * This is a performance optimization to avoid doing DFS at each feature iteration
 */
function _getViewportExpressions (rootExpressions) {
    const viewportExpressions = [];

    function dfs (expr) {
        if (expr._isViewport) {
            viewportExpressions.push(expr);
        } else {
            expr._getChildren().map(dfs);
        }
    }

    rootExpressions.map(dfs);
    return viewportExpressions;
}

/**
 * Reset previous viewport aggregation function values.
 * It assumes that all dataframes of the renderLayer share the same metadata
 */
function _reset (viewportExpressions, renderLayer) {
    const metadata = renderLayer.viz.metadata;
    viewportExpressions.forEach(expr => expr._resetViewportAgg(metadata, renderLayer));
}

/**
 * Run all viewport aggregations in the active dataframes
 */
function _runInActiveDataframes (viewportExpressions, renderLayer) {
    const processedFeaturesIDs = new Set(); // same feature can belong to multiple dataframes
    const dataframes = renderLayer.getActiveDataframes();
    const viz = renderLayer.viz;

    dataframes.forEach(dataframe => {
        _runInDataframe(viz, viewportExpressions, dataframe, processedFeaturesIDs);
    });
    if (processedFeaturesIDs.size === 0) {
        return;
    }

    const viewportFeaturesExpressions = viewportExpressions.filter(exp => exp.isA(ViewportFeatures));
    if (viewportFeaturesExpressions.length > 0) {
        _runViewportFeatures(viewportFeaturesExpressions, renderLayer, processedFeaturesIDs);
    }
}

/**
 * Run viewport aggregations in the dataframe. It excludes features:
 *    - already accumulated in other dataframes
 *    - outside the viewport
 *    - filtered out
 */
function _runInDataframe (viz, viewportExpressions, dataframe, processedFeaturesIDs) {
    for (let i = 0; i < dataframe.numFeatures; i++) {
        const featureId = dataframe.properties[viz.metadata.idProperty][i];

        const featureAlreadyAccumulated = processedFeaturesIDs.has(featureId);
        if (featureAlreadyAccumulated) {
            continue; // This is correct for viewportExpressions related to 'alphanumeric' properties (not geometry-related)
        }

        const featureOutsideViewport = !dataframe.inViewport(i);
        if (featureOutsideViewport) {
            continue;
        }

        // a new feature, inside the viewport
        processedFeaturesIDs.add(featureId);
        const feature = dataframe.getFeature(i);

        const featureIsFilteredOut = viz.filter.eval(feature) < FILTERING_THRESHOLD;
        if (featureIsFilteredOut) {
            continue;
        }

        // not a filtered feature, so pass the rawFeature to viewport expressions
        viewportExpressions.forEach(expr => expr.accumViewportAgg(feature));
    }
}

function _runViewportFeatures (viewportFeaturesExpressions, renderLayer, processedFeaturesIDs) {
    const dataframes = renderLayer.getActiveDataframes();
    const idProperty = renderLayer.viz.metadata.idProperty;

    // Reset previous expressions with (possibly partial) features
    viewportFeaturesExpressions.forEach(expr => expr._resetViewportAgg(null, renderLayer));

    // Accumulate considering the featurePieces
    processedFeaturesIDs.forEach((featureId) => {
        const featurePieces = dataframes.reduce((result, dataframe) => {
            _addPartialFeatureIfExistsIn(dataframe, featureId, idProperty, result);
            return result;
        }, []);
        viewportFeaturesExpressions.forEach(expr => expr.accumViewportAgg(featurePieces));
    });
}

/**
 * Add the feature with featureId in the dataframe, if is included there.
 * It could be just a, geometrically speaking, 'partial feature' (a piece of it)
 */
function _addPartialFeatureIfExistsIn (dataframe, featureId, idProperty, result) {
    let partialFeature;

    for (let i = 0; i < dataframe.numFeatures; i++) {
        const currentId = dataframe.properties[idProperty][i];
        if (currentId === featureId) {
            partialFeature = dataframe.getFeature(i);
            break;
        }
    }

    if (partialFeature !== undefined) {
        result.push(partialFeature);
    }
}
