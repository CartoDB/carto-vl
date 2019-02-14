import { FILTERING_THRESHOLD } from '../../../../Renderer';

export function runGlobalAggregations (renderLayer) {
    const globalExpressions = _getGlobalExpressions(renderLayer.viz._getRootExpressions());
    if (!globalExpressions.length) {
        return;
    }

    _runInActiveDataframes(globalExpressions, renderLayer);
}

function _getGlobalExpressions (rootExpressions) {
    const globalExpressions = [];

    function dfs (expr) {
        if (expr._isGlobal) {
            globalExpressions.push(expr);
        } else {
            expr._getChildren().map(dfs);
        }
    }

    rootExpressions.map(dfs);

    return globalExpressions;
}

/**
 * Run all global aggregations in the active dataframes
 */
function _runInActiveDataframes (globalExpressions, renderLayer) {
    const dataframes = renderLayer.getActiveDataframes();
    const inGlobalFeaturesIDs = _runInDataframes(globalExpressions, renderLayer, dataframes);

    _runImprovedForPartialFeatures(globalExpressions, renderLayer, inGlobalFeaturesIDs);
}

/**
 * Run all global aggregations in the dataframes, and returns a list of featureIDs inside the
 * global & not filtered out. That's a list of the features effectively included in the globalExpressions run
 */
function _runInDataframes (globalExpressions, renderLayer, dataframes) {
    const processedFeaturesIDs = new Set(); // same feature can belong to multiple dataframes
    const viz = renderLayer.viz;

    const inGlobalFeaturesIDs = new Set();
    dataframes.forEach(dataframe => {
        _runInDataframe(viz, globalExpressions, dataframe, processedFeaturesIDs, inGlobalFeaturesIDs);
    });
    return inGlobalFeaturesIDs;
}

/**
 * Run an improved globalFeatures just for lines or polygons (considering the existence of partial Features)
 */
function _runImprovedForPartialFeatures (globalExpressions, renderLayer, inGlobalFeaturesIDs) {
    return _runForPartialGlobalFeatures(globalExpressions, renderLayer, inGlobalFeaturesIDs);
}

/**
 * Run global aggregations in the dataframe. It excludes features:
 *    - already accumulated in other dataframes
 *    - outside the global
 *    - filtered out
 */
function _runInDataframe (viz, globalExpressions, dataframe, processedFeaturesIDs, inGlobalFeaturesIDs) {
    for (let i = 0; i < dataframe.numFeatures; i++) {
        const idProperty = viz.metadata.idProperty;
        const featureId = dataframe.properties[idProperty][i];

        const featureAlreadyAccumulated = processedFeaturesIDs.has(featureId);
        if (featureAlreadyAccumulated) {
            continue; // This is correct for globalExpressions related to 'alphanumeric' properties (not geometry-related)
        }

        // a new feature, inside the global
        processedFeaturesIDs.add(featureId);
        const feature = dataframe.getFeature(i);

        const featureIsFilteredOut = viz.filter.eval(feature) < FILTERING_THRESHOLD;
        if (featureIsFilteredOut) {
            continue;
        }

        inGlobalFeaturesIDs.add(feature[idProperty]); // inGlobal & in filter

        // not a filtered feature, so pass the rawFeature to global expressions
        globalExpressions.forEach(expr => expr.accumGlobalAgg(feature));
    }
}

/**
 * Rerun globalFeatures to improve its results, including all feature pieces in dataframes
 */
function _runForPartialGlobalFeatures (globalFeaturesExpressions, renderLayer, featuresIDs) {
    // Reset previous expressions with (possibly 1 partial) features
    globalFeaturesExpressions.forEach(expr => expr._resetGlobalAgg(null, renderLayer));

    // Gather all pieces per feature
    const piecesPerFeature = renderLayer.getAllPiecesPerFeature(featuresIDs);

    // Run globalFeatures with the whole set of feature pieces
    globalFeaturesExpressions.forEach(expr => {
        for (const featureId in piecesPerFeature) {
            expr.accumGlobalAgg(piecesPerFeature[featureId]);
        }
    });
}
