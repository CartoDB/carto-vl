import { VectorTile } from '@mapbox/vector-tile';
import * as Protobuf from 'pbf';
import * as rsys from '../client/rsys';
import { decodeLines, decodePolygons } from '../client/mvt/feature-decoder';
import Metadata from '../renderer/Metadata';
import DummyDataframe from '../renderer/DummyDataframe';
import CartoValidationError, { CartoValidationTypes as cvt } from '../errors/carto-validation-error';
import CartoRuntimeError, { CartoRuntimeTypes as crt } from '../errors/carto-runtime-error';

// TODO import correctly
const RTT_WIDTH = 1024;

// Constants for '@mapbox/vector-tile' geometry types, from https://github.com/mapbox/vector-tile-js/blob/v1.3.0/lib/vectortilefeature.js#L39
const mvtDecoderGeomTypes = { point: 1, line: 2, polygon: 3 };

const geometryTypes = {
    UNKNOWN: 'unknown',
    POINT: 'point',
    LINE: 'line',
    POLYGON: 'polygon'
};

const MVT_TO_CARTO_TYPES = {
    1: geometryTypes.POINT,
    2: geometryTypes.LINE,
    3: geometryTypes.POLYGON
};

export class MVTWorker {
    // Worker API
    onmessage (event) {
        this.processEvent(event).then(message => {
            const transferables = [];
            if (!message.dataframe.empty) {
                transferables.push(this._propertiesArrayBuffer);
                transferables.push(message.dataframe.decodedGeom.verticesArrayBuffer);
                if (message.dataframe.decodedGeom.normalsArrayBuffer) {
                    transferables.push(message.dataframe.decodedGeom.normalsArrayBuffer);
                }
            }
            postMessage(message, transferables);
        });
    }
    async processEvent (event) {
        const params = event.data;
        if (params.metadata) {
            Object.setPrototypeOf(params.metadata, Metadata.prototype);
            this.metadata = params.metadata;
        }
        const dataframe = await this._requestDataframe(params.x, params.y, params.z, params.url, params.layerID, this.metadata);
        return {
            mID: params.mID,
            dataframe
        };
    }

    async _requestDataframe (x, y, z, url, layerID, metadata) {
        const response = await fetch(url);
        const dataframe = await this.urlToDataframeTransformer(response, x, y, z, layerID, metadata);
        return dataframe;
    }

    async urlToDataframeTransformer (response, x, y, z, layerID, metadata) {
        const MVT_EXTENT = 4096;
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength === 0 || response === 'null') {
            return { empty: true };
        }
        const tile = new VectorTile(new Protobuf(arrayBuffer));

        if (Object.keys(tile.layers).length > 1 && !layerID) {
            throw new CartoValidationError(
                `${cvt.MISSING_REQUIRED} LayerID parameter wasn't specified and the MVT tile contains multiple layers: ${JSON.stringify(Object.keys(tile.layers))}.`
            );
        }

        const mvtLayer = tile.layers[layerID || Object.keys(tile.layers)[0]]; // FIXME this!!!

        if (!mvtLayer) {
            return { empty: true };
        }

        const { geometries, properties, numFeatures } = this._decodeMVTLayer(mvtLayer, metadata, MVT_EXTENT);
        const rs = rsys.getRsysFromTile(x, y, z);
        const dataframe = this._generateDataFrame(rs, geometries, properties, numFeatures, metadata.geomType, metadata);

        return dataframe;
    }

    _decodeMVTLayer (mvtLayer, metadata, mvtExtent) {
        if (!mvtLayer.length) {
            return { properties: [], geometries: {}, numFeatures: 0 };
        }
        if (!metadata.geomType) {
            metadata.geomType = this._autoDiscoverType(mvtLayer);
        }
        switch (metadata.geomType) {
            case geometryTypes.POINT:
                const arrayBuffer = new ArrayBuffer(mvtLayer.length * 2 * 3 * 4);// SIZEOF
                return this._decode(mvtLayer, metadata, mvtExtent, arrayBuffer);
            case geometryTypes.LINE:
                return this._decode(mvtLayer, metadata, mvtExtent, [], decodeLines);
            case geometryTypes.POLYGON:
                return this._decode(mvtLayer, metadata, mvtExtent, [], decodePolygons);
            default:
                throw new CartoValidationError(`${cvt.INCORRECT_TYPE} MVT: invalid geometry type '${metadata.geomType}'`);
        }
    }

    _autoDiscoverType (mvtLayer) {
        const type = mvtLayer.feature(0).type;
        switch (type) {
            case mvtDecoderGeomTypes.point:
                return geometryTypes.POINT;
            case mvtDecoderGeomTypes.line:
                return geometryTypes.LINE;
            case mvtDecoderGeomTypes.polygon:
                return geometryTypes.POLYGON;
            default:
                throw new CartoValidationError(`${cvt.INCORRECT_TYPE} MVT: invalid geometry type '${type}'`);
        }
    }

    _decode (mvtLayer, metadata, mvtExtent, geometries, decodeFn) {
        let numFeatures = 0;
        let pointGeometries;
        if (geometries) {
            pointGeometries = new Float32Array(geometries);
        }
        const { properties, propertyNames } = this._initializePropertyArrays(metadata, mvtLayer.length);
        for (let i = 0; i < mvtLayer.length; i++) {
            const f = mvtLayer.feature(i);
            this._checkType(f, metadata.geomType);
            const geom = f.loadGeometry();
            if (decodeFn) {
                const decodedPolygons = decodeFn(geom, mvtExtent);
                geometries.push(decodedPolygons);
            } else {
                // TODO refactor
                const x = 2 * (geom[0][0].x) / mvtExtent - 1.0;
                const y = 2 * (1.0 - (geom[0][0].y) / mvtExtent) - 1.0;
                // Tiles may contain points in the border;
                // we'll avoid here duplicated points between tiles by excluding the 1-edge
                if (x < -1 || x >= 1 || y < -1 || y >= 1) {
                    continue;
                }
                pointGeometries[6 * numFeatures + 0] = x;
                pointGeometries[6 * numFeatures + 1] = y;
                pointGeometries[6 * numFeatures + 2] = x;
                pointGeometries[6 * numFeatures + 3] = y;
                pointGeometries[6 * numFeatures + 4] = x;
                pointGeometries[6 * numFeatures + 5] = y;
            }
            if (f.properties[metadata.idProperty] === undefined) {
                throw new CartoRuntimeError(
                    `${crt.MVT} MVT feature with undefined idProperty '${metadata.idProperty}'`
                );
            }
            this._decodeProperties(metadata, propertyNames, properties, f, numFeatures);
            numFeatures++;
        }

        return { properties, geometries, numFeatures };
    }

    // Currently only mvtLayers with the same type in every feature are supported
    _checkType (feature, expected) {
        const type = feature.type;
        const actual = MVT_TO_CARTO_TYPES[type];
        if (actual !== expected) {
            throw new CartoRuntimeError(
                `${crt.MVT} MVT: mixed geometry types in the same layer. Layer has type: ${expected} but feature was ${actual}`
            );
        }
    }

    _initializePropertyArrays (metadata, length) {
        const propertyNames = this._getPropertyNamesFrom(metadata);
        const properties = this._getPropertiesFor(propertyNames, length);
        return { propertyNames, properties };
    }

    _getPropertyNamesFrom (metadata) {
        const propertyNames = [];
        for (let i = 0; i < metadata.propertyKeys.length; i++) {
            const propertyName = metadata.propertyKeys[i];
            if (metadata.properties[propertyName].type === 'geometry') {
                continue;
            }
            propertyNames.push(...metadata.propertyNames(propertyName));
        }
        return propertyNames;
    }

    _getPropertiesFor (propertyNames, length) {
        const properties = {};
        const size = Math.ceil(length / RTT_WIDTH) * RTT_WIDTH;

        const arrayBuffer = new ArrayBuffer(4 * size * propertyNames.length);
        this._propertiesArrayBuffer = arrayBuffer;
        for (let i = 0; i < propertyNames.length; i++) {
            const propertyName = propertyNames[i];
            properties[propertyName] = new Float32Array(arrayBuffer, i * 4 * size, size);
        }

        return properties;
    }

    _decodeProperties (metadata, propertyNames, properties, feature, i) {
        const length = propertyNames.length;
        for (let j = 0; j < length; j++) {
            const propertyName = propertyNames[j];
            const propertyValue = feature.properties[propertyName];
            properties[propertyName][i] = this.decodeProperty(metadata, propertyName, propertyValue);
        }
    }

    decodeProperty (metadata, propertyName, propertyValue) {
        const metadataPropertyType = metadata.properties[propertyName].type;
        if (typeof propertyValue === 'string') {
            if (metadataPropertyType !== 'category') {
                throw new CartoRuntimeError(`${crt.MVT} MVT decoding error. Metadata property '${propertyName}' is of type '${metadataPropertyType}' but the MVT tile contained a feature property of type 'string': '${propertyValue}'`);
            }
            return metadata.categorizeString(propertyName, propertyValue);
        } else if (propertyValue === null || propertyValue === undefined || Number.isNaN(propertyValue)) {
            return Number.MIN_SAFE_INTEGER;
        } else if (typeof propertyValue === 'number') {
            if (metadataPropertyType !== 'number') {
                throw new CartoRuntimeError(`${crt.MVT} MVT decoding error. Metadata property '${propertyName}' is of type '${metadataPropertyType}' but the MVT tile contained a feature property of type 'number': '${propertyValue}'`);
            }
            return propertyValue;
        } else {
            throw new CartoRuntimeError(`${crt.MVT} MVT decoding error. Feature property value of type '${typeof propertyValue}' cannot be decoded.`);
        }
    }

    _generateDataFrame (rs, geometry, properties, size, type, metadata) {
        return new DummyDataframe({
            active: false,
            center: rs.center,
            geom: geometry,
            properties: properties,
            scale: rs.scale,
            size: size,
            type: type,
            metadata
        });
    }
}
