
import { FILTERING_THRESHOLD } from '../../../../Renderer';
import ViewportFeatures from '../../viewportFeatures';
import { GEOMETRY_TYPE } from '../../../../../utils/geometry';

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
    const dataframes = renderLayer.getActiveDataframes();
    const inViewportFeaturesIDs = _runInDataframes(viewportExpressions, renderLayer, dataframes);

    _runImprovedForPartialFeatures(viewportExpressions, renderLayer, inViewportFeaturesIDs);
}

/**
 * Run all viewport aggregations in the dataframes, and returns a list of featureIDs inside the
 * viewport & not filtered out. That's a list of the features effectively included in the viewportExpressions run
 */
function _runInDataframes (viewportExpressions, renderLayer, dataframes) {
    const processedFeaturesIDs = new Set(); // same feature can belong to multiple dataframes
    const viz = renderLayer.viz;

    const inViewportFeaturesIDs = new Set();
    dataframes.forEach(dataframe => {
        _runInDataframe(viz, viewportExpressions, dataframe, processedFeaturesIDs, inViewportFeaturesIDs);
    });
    return inViewportFeaturesIDs;
}

/**
 * Run an improved viewportFeatures just for lines or polygons (considering the existence of partial Features)
 */
function _runImprovedForPartialFeatures (viewportExpressions, renderLayer, inViewportFeaturesIDs) {
    const noFeatures = (inViewportFeaturesIDs.size === 0);
    if (noFeatures) {
        return;
    }

    const noPossiblePartialFeatures = (renderLayer.viz.geometryType === GEOMETRY_TYPE.POINT);
    if (noPossiblePartialFeatures) {
        return;
    }

    const viewportFeaturesExpressions = viewportExpressions.filter(exp => exp.isA(ViewportFeatures));
    if (viewportFeaturesExpressions.length > 0) {
        _runForPartialViewportFeatures(viewportFeaturesExpressions, renderLayer, inViewportFeaturesIDs);
    }
}

/**
 * Run viewport aggregations in the dataframe. It excludes features:
 *    - already accumulated in other dataframes
 *    - outside the viewport
 *    - filtered out
 */
function _runInDataframe (viz, viewportExpressions, dataframe, processedFeaturesIDs, inViewportFeaturesIDs) {
    for (let i = 0; i < dataframe.numFeatures; i++) {
        const idProperty = viz.metadata.idProperty;
        const featureId = dataframe.properties[idProperty][i];

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

        inViewportFeaturesIDs.add(feature[idProperty]); // inViewport & in filter

        // not a filtered feature, so pass the rawFeature to viewport expressions
        viewportExpressions.forEach(expr => expr.accumViewportAgg(feature));
    }
}

/**
 * Rerun viewportFeatures to improve its results, including all feature pieces in dataframes
 */
function _runForPartialViewportFeatures (viewportFeaturesExpressions, renderLayer, featuresIDs) {
    // Reset previous expressions with (possibly 1 partial) features
    viewportFeaturesExpressions.forEach(expr => expr._resetViewportAgg(null, renderLayer));

    // Gather all pieces per feature
    const piecesPerFeature = renderLayer.getAllPiecesPerFeature(featuresIDs);

    // Run viewportFeatures with the whole set of feature pieces
    viewportFeaturesExpressions.forEach(expr => {
        for (const featureId in piecesPerFeature) {
            expr.accumViewportAgg(piecesPerFeature[featureId]);
        }
    });
}
