import { VectorTile } from '@mapbox/vector-tile';
import * as Protobuf from 'pbf';
import * as rsys from '../client/rsys';
import Dataframe from '../renderer/Dataframe';
import { decodeLines, decodePolygons } from '../client/mvt/feature-decoder';
import Metadata from '../renderer/Metadata';

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

class MVTWorker {
    async _requestDataframe (x, y, z, url, layerID, metadata) {
        const response = await fetch(url);
        const dataframe = await this.responseToDataframeTransformer(response, x, y, z, layerID, metadata);
        return dataframe;
    }

    // From MVT
    async responseToDataframeTransformer (response, x, y, z, layerID, metadata) {
        const MVT_EXTENT = 4096;
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength === 0 || response === 'null') {
            return { empty: true };
        }
        const tile = new VectorTile(new Protobuf(arrayBuffer));

        if (Object.keys(tile.layers).length > 1 && !layerID) {
            throw new Error(`LayerID parameter wasn't specified and the MVT tile contains multiple layers: ${JSON.stringify(Object.keys(tile.layers))}`);
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
                return this._decode(mvtLayer, metadata, mvtExtent, new Float32Array(mvtLayer.length * 2 * 3));
            case geometryTypes.LINE:
                return this._decode(mvtLayer, metadata, mvtExtent, [], decodeLines);
            case geometryTypes.POLYGON:
                return this._decode(mvtLayer, metadata, mvtExtent, [], decodePolygons);
            default:
                throw new Error('MVT: invalid geometry type');
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
                throw new Error('MVT: invalid geometry type');
        }
    }

    _decode (mvtLayer, metadata, mvtExtent, geometries, decodeFn) {
        let numFeatures = 0;
        const { properties, propertyNames } = this._initializePropertyArrays(metadata, mvtLayer.length);
        for (let i = 0; i < mvtLayer.length; i++) {
            const f = mvtLayer.feature(i);
            this._checkType(f, metadata.geomType);
            const geom = f.loadGeometry();
            if (decodeFn) {
                const decodedPolygons = decodeFn(geom, mvtExtent);
                geometries.push(decodedPolygons);
            } else {
                const x = 2 * (geom[0][0].x) / mvtExtent - 1.0;
                const y = 2 * (1.0 - (geom[0][0].y) / mvtExtent) - 1.0;
                // Tiles may contain points in the border;
                // we'll avoid here duplicated points between tiles by excluding the 1-edge
                if (x < -1 || x >= 1 || y < -1 || y >= 1) {
                    continue;
                }
                geometries[6 * numFeatures + 0] = x;
                geometries[6 * numFeatures + 1] = y;
                geometries[6 * numFeatures + 2] = x;
                geometries[6 * numFeatures + 3] = y;
                geometries[6 * numFeatures + 4] = x;
                geometries[6 * numFeatures + 5] = y;
            }
            if (f.properties[metadata.idProperty] === undefined) {
                throw new Error(`MVT feature with undefined idProperty '${metadata.idProperty}'`);
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
            throw new Error(`MVT: mixed geometry types in the same layer. Layer has type: ${expected} but feature was ${actual}`);
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
        if (typeof propertyValue === 'string') {
            if (metadata.properties[propertyName].type !== 'category') {
                throw new Error(`MVT decoding error. Metadata property '${propertyName}' is of type '${metadata.properties[propertyName].type}' but the MVT tile contained a feature property of type string: '${propertyValue}'`);
            }
            return metadata.categorizeString(propertyName, propertyValue);
        } else if (typeof propertyValue === 'number') {
            if (metadata.properties[propertyName].type !== 'number') {
                throw new Error(`MVT decoding error. Metadata property '${propertyName}' is of type '${metadata.properties[propertyName].type}' but the MVT tile contained a feature property of type number: '${propertyValue}'`);
            }
            return propertyValue;
        } else if (propertyValue === null || propertyValue === undefined) {
            return Number.NaN;
        } else {
            throw new Error(`MVT decoding error. Feature property value of type '${typeof propertyValue}' cannot be decoded.`);
        }
    }

    _generateDataFrame (rs, geometry, properties, size, type, metadata) {
        return new Dataframe({
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

const worker = new MVTWorker();

onmessage = function (event) {
    processEvent(event).then(message => {
        message.dataframe.geom = null;
        postMessage(message, message.dataframe.empty ? [] : [message.dataframe.decodedGeom.arrayBuffer1, message.dataframe.decodedGeom.arrayBuffer2]);
    });
};

async function processEvent (event) {
    const params = event.data;
    Object.setPrototypeOf(params.metadata, new Metadata());
    const dataframe = await worker._requestDataframe(params.x, params.y, params.z, params.url, params.layerID, params.metadata);
    return {
        mID: params.mID,
        dataframe
    };
}
