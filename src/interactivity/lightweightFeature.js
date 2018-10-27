import VIZ_PROPERTIES from '../renderer/viz/utils/properties';
import { generateBlenderFunction, generateResetFunction } from './blendUtils';

/**
 * Generate a lightweight Feature-like class
 * Its main purpouse is to define a light class to improve performance when creating a
 * high number of features (see `viewportFeatures`)
 *
 * @param {*} propertyNames
 * @param {*} renderLayer
 * @returns FeatureLike class
 */
export function genLightweightFeatureClass (propertyNames, renderLayer) {
    const cls = class LightweightFeature {
        constructor (rawFeature) {
            this._rawFeature = rawFeature;
        }
    };

    _defineIdProperty(cls.prototype, renderLayer);
    _defineVizProperties(cls.prototype, renderLayer);
    _defineVizVariables(cls.prototype, renderLayer);
    _defineFeatureProperties(cls.prototype, propertyNames);
    _defineResetMethod(cls.prototype);

    return cls;
}

function _defineIdProperty (targetObject, renderLayer) {
    Object.defineProperty(targetObject, 'id', {
        get: function () {
            const idProperty = renderLayer.viz.metadata.idProperty;
            return this._rawFeature[idProperty];
        },
        configurable: true
    });
}

function _defineVizProperties (targetObject, renderLayer) {
    VIZ_PROPERTIES.forEach(prop => {
        _createLightweightFeatureVizProperty(targetObject, renderLayer, prop);
    });
}

function _createLightweightFeatureVizProperty (targetObject, renderLayer, prop, propName = prop) {
    const { customizedFeatures, viz, trackFeatureViz, parseVizExpression } = renderLayer;
    const idProperty = viz.metadata.idProperty;
    const blender = (featureId) => {
        return generateBlenderFunction(prop, featureId, customizedFeatures, viz, trackFeatureViz, idProperty, parseVizExpression);
    };
    const reset = (featureId) => {
        return generateResetFunction(prop, featureId, customizedFeatures, viz, idProperty);
    };

    Object.defineProperty(targetObject, propName, {
        get: function () {
            return {
                blendTo: (...args) => {
                    return blender(this.id)(...args);
                },
                reset: (...args) => {
                    return reset(this.id)(...args);
                },
                value: viz[prop].eval(this._rawFeature)
            };
        }
    });
}

function _defineVizVariables (targetObject, renderLayer) {
    Object.defineProperty(targetObject, 'variables', {
        get: function () {
            const variables = {};

            // To allow the use of this.id in `_createLightweightFeatureVizProperty`
            Object.defineProperty(variables, 'id', {
                get: function () { return this.id; }
            });

            // viz variables
            const vizVariables = renderLayer.viz.variables;
            Object.keys(vizVariables).forEach(varName => {
                const name = `__cartovl_variable_${varName}`;
                _createLightweightFeatureVizProperty(variables, renderLayer, name, varName);
            });
            return variables;
        }
    });
}

function _defineFeatureProperties (targetObject, propertyNames) {
    propertyNames.forEach(prop => {
        Object.defineProperty(targetObject, prop, {
            get: function () {
                return this._rawFeature[prop];
            }
        });
    });
}

function _defineResetMethod (targetObject) {
    Object.defineProperty(targetObject, 'reset', {
        get: function () {
            const reset = (duration = 500) => {
                VIZ_PROPERTIES.forEach((property) => {
                    this[property].reset(duration);
                });

                for (let key in this.variables) {
                    this.variables[key].reset(duration);
                }
            };
            return reset;
        }
    });
}
