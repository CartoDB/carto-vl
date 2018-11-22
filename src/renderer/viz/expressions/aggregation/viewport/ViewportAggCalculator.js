
import { FILTERING_THRESHOLD } from '../../../../Renderer';

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
    dataframes.forEach(dataframe => {
        _runInDataframe(renderLayer.viz, viewportExpressions, dataframe, processedFeaturesIDs);
    });
}

/**
 * Run viewport aggregations in the dataframe. It excludes features:
 *    - already accumlated in other dataframes
 *    - outside the viewport
 *    - filtered out
 */
function _runInDataframe (viz, viewportExpressions, dataframe, processedFeaturesIDs) {
    for (let i = 0; i < dataframe.numFeatures; i++) {
        const featureId = dataframe.properties[viz.metadata.idProperty][i];

        const featureAlreadyAccumulated = processedFeaturesIDs.has(featureId);
        if (featureAlreadyAccumulated) {
            continue;
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

        // not a filtered feature, so pass the rawFeature to all viewport aggregations
        viewportExpressions.forEach(expr => expr.accumViewportAgg(feature));
    }
}
