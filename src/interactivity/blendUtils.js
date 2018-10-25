import { blend, property, transition, notEquals } from '../renderer/viz/expressions';

export function generateResetFunction (propertyName, id, customizedFeatures, viz, idProperty) {
    return function reset (duration = 500) {
        if (customizedFeatures[id] && customizedFeatures[id][propertyName]) {
            customizedFeatures[id][propertyName].replaceChild(
                customizedFeatures[id][propertyName].mix,
                // transition(0) is used to ensure that blend._predraw() "GC" collects it
                blend(notEquals(property(idProperty), id), transition(0), transition(duration))
            );
            viz[propertyName].notify();
            customizedFeatures[id][propertyName] = undefined;
        }
    };
}

export function generateBlenderFunction (propertyName, id, customizedFeatures, viz, trackFeatureViz, idProperty, parseVizExpression) {
    return function generatedBlendTo (newExpression, duration = 500) {
        if (typeof newExpression === 'string') {
            newExpression = parseVizExpression(newExpression);
        }
        if (customizedFeatures[id] && customizedFeatures[id][propertyName]) {
            customizedFeatures[id][propertyName].a.blendTo(newExpression, duration);
            return;
        }
        const blendExpr = blend(
            newExpression,
            viz[propertyName],
            blend(1, notEquals(property(idProperty), id), transition(duration))
        );
        trackFeatureViz(id, propertyName, blendExpr, customizedFeatures);
        viz.replaceChild(
            viz[propertyName],
            blendExpr
        );
        viz[propertyName].notify();
    };
}
