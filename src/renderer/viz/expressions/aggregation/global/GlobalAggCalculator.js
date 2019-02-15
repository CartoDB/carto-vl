export function runGlobalAggregations (renderLayer) {
    const globalExpressions = _getGlobalExpressions(renderLayer.viz._getRootExpressions());

    if (!globalExpressions.length) {
        return;
    }

    _runInActiveDataframes(globalExpressions, renderLayer);
}

function _getGlobalExpressions (rootExpressions) {
    const globalExpressions = [];

    function addGlobalExpressions (expr) {
        if (expr._isGlobal) {
            globalExpressions.push(expr);
        } else {
            expr._getChildren().map(addGlobalExpressions);
        }
    }

    rootExpressions.forEach(addGlobalExpressions);

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
    const viz = renderLayer.viz;
    const processedFeaturesIDs = new Set(); // same feature can belong to multiple dataframes
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
        processedFeaturesIDs.add(featureId);
        const feature = dataframe.getFeature(i);

        inGlobalFeaturesIDs.add(feature[idProperty]);
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
    // const piecesPerFeature = renderLayer.getAllPiecesPerFeature(featuresIDs);
    const piecesPerFeature = renderLayer.getAllPieces(featuresIDs);
    // Run globalFeatures with the whole set of feature pieces
    globalFeaturesExpressions.forEach(expr => {
        for (const featureId in piecesPerFeature) {
            expr.accumGlobalAgg(piecesPerFeature[featureId]);
        }
    });
}
