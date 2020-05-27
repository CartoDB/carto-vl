import { VectorTile } from '@mapbox/vector-tile';
import * as Protobuf from 'pbf';
import * as rsys from '../../client/rsys';
import { decodeLines, decodePolygons } from '../../client/mvt/feature-decoder';
import MVTMetadata from '../MVTMetadata';
import DummyDataframe from '../../renderer/dataframe/DummyDataframe';
import CartoValidationError, { CartoValidationErrorTypes } from '../../errors/carto-validation-error';
import CartoRuntimeError, { CartoRuntimeErrorTypes } from '../../errors/carto-runtime-error';
import { GEOMETRY_TYPE } from '../../utils/geometry';
import BigQueryTilesetClient from './BQTilesetClient';

// TODO import correctly
const RTT_WIDTH = 1024;

// Constants for '@mapbox/vector-tile' geometry types, from https://github.com/mapbox/vector-tile-js/blob/v1.3.0/lib/vectortilefeature.js#L39
const mvtDecoderGeomTypes = { point: 1, line: 2, polygon: 3 };

const MVT_TO_CARTO_TYPES = {
    1: GEOMETRY_TYPE.POINT,
    2: GEOMETRY_TYPE.LINE,
    3: GEOMETRY_TYPE.POLYGON
};

const DEFAULT_ID_PROPERTY = '___id';

export class BigQueryTilesetWorker {
    // Worker API
    onmessage (event) {
        this.processEvent(event).then(postMessage);
    }

    async processEvent (event) {
        const params = event.data;
        if (params.metadata) {
            this.castMetadata(params.metadata);
            this.metadata = params.metadata;
        }
        const dataframes = await this._requestDataframes(params.tiles, params.tilesetData, params.tilesetMetadata, this.metadata);
        return {
            mID: params.mID,
            dataframes
        };
    }

    castMetadata (metadata) {
        Object.setPrototypeOf(metadata, MVTMetadata.prototype);
        metadata.setCodecs();
    }

    async _requestDataframes (tiles, tilesetData, tilesetMetadata, metadata) {
        const client = new BigQueryTilesetClient(tilesetData.project, tilesetData.token);
        const responseTiles = await client.fetchTiles(tiles, tilesetData.dataset, tilesetData.tileset, tilesetMetadata);
        const dataframes = await Promise.all(tiles.map((t) => {
            const responseTile = responseTiles && responseTiles.find((rt) => (rt.x === t.x && rt.y === t.y && rt.z === t.z));
            if (responseTile) {
                return this.responseToDataframeTransformer(responseTile, metadata);
            } else {
                return { x: t.x, y: t.y, z: t.z, empty: true };
            }
        }));
        return dataframes;
    }

    responseToDataframeTransformer ({ x, y, z, buffer }, metadata) {
        return new Promise((resolve) => {
            const MVT_EXTENT = metadata.extent;
            if (buffer.byteLength === 0) {
                return resolve({ x, y, z, empty: true });
            }
            const tile = new VectorTile(new Protobuf(buffer));

            if (Object.keys(tile.layers).length > 1) {
                throw new CartoValidationError(
                    `LayerID parameter wasn't specified and the MVT tile contains multiple layers: ${JSON.stringify(Object.keys(tile.layers))}.`,
                    CartoValidationErrorTypes.MISSING_REQUIRED
                );
            }

            const mvtLayer = tile.layers[Object.keys(tile.layers)[0]];

            if (!mvtLayer) {
                return resolve({ empty: true });
            }

            const { geometries, properties, propertiesArrayBuffer, numFeatures } = this._decodeMVTLayer(mvtLayer, metadata, MVT_EXTENT);
            const rs = rsys.getRsysFromTile(x, y, z);
            resolve(this._generateDataFrame(rs, geometries, properties, propertiesArrayBuffer, numFeatures, metadata.geomType, metadata, x, y, z));
        });
    }

    _decodeMVTLayer (mvtLayer, metadata, mvtExtent) {
        if (!mvtLayer.length) {
            return { properties: [], geometries: {}, propertiesArrayBuffer: [], numFeatures: 0 };
        }
        if (!metadata.geomType) {
            metadata.geomType = this._autoDiscoverType(mvtLayer);
        }
        switch (metadata.geomType) {
            case GEOMETRY_TYPE.POINT:
                const arrayBuffer = new ArrayBuffer(mvtLayer.length * 2 * 3 * 4);// SIZEOF
                return this._decode(mvtLayer, metadata, mvtExtent, arrayBuffer);
            case GEOMETRY_TYPE.LINE:
                return this._decode(mvtLayer, metadata, mvtExtent, [], decodeLines);
            case GEOMETRY_TYPE.POLYGON:
                return this._decode(mvtLayer, metadata, mvtExtent, [], decodePolygons);
            default:
                throw new CartoValidationError(`MVT: invalid geometry type '${metadata.geomType}'`, CartoValidationErrorTypes.INCORRECT_TYPE);
        }
    }

    _autoDiscoverType (mvtLayer) {
        const type = mvtLayer.feature(0).type;
        switch (type) {
            case mvtDecoderGeomTypes.point:
                return GEOMETRY_TYPE.POINT;
            case mvtDecoderGeomTypes.line:
                return GEOMETRY_TYPE.LINE;
            case mvtDecoderGeomTypes.polygon:
                return GEOMETRY_TYPE.POLYGON;
            default:
                throw new CartoValidationError(`MVT: invalid geometry type '${type}'`, CartoValidationErrorTypes.INCORRECT_TYPE);
        }
    }

    _decode (mvtLayer, metadata, mvtExtent, geometries, decodeFn) {
        let numFeatures = 0;
        let pointGeometries;
        if (geometries) {
            pointGeometries = new Float32Array(geometries);
        }
        const { properties, propertiesArrayBuffer } = this._initializePropertyArrays(metadata, mvtLayer.length);
        const scalarPropertyCodecs = this._scalarPropertyCodecs(metadata);
        const rangePropertyCodecs = this._rangePropertyCodecs(metadata);
        for (let i = 0; i < mvtLayer.length; i++) {
            const feature = mvtLayer.feature(i);
            this._checkType(feature, metadata.geomType);
            const geom = feature.loadGeometry();
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
            this._decodeProperties(metadata, scalarPropertyCodecs, rangePropertyCodecs, properties, feature, numFeatures);
            numFeatures++;
        }

        return { properties, propertiesArrayBuffer, geometries, numFeatures };
    }

    // Currently only mvtLayers with the same type in every feature are supported
    _checkType (feature, expected) {
        const type = feature.type;
        const actual = MVT_TO_CARTO_TYPES[type];
        if (actual !== expected) {
            throw new CartoRuntimeError(
                `MVT: mixed geometry types in the same layer. Layer has type: ${expected} but feature was ${actual}`,
                CartoRuntimeErrorTypes.MVT
            );
        }
    }

    _initializePropertyArrays (metadata, length) {
        const propertyNames = this._getPropertyNamesFrom(metadata);
        const { properties, propertiesArrayBuffer } = this._getPropertiesFor(propertyNames, length);
        return { propertyNames, properties, propertiesArrayBuffer };
    }

    _getSourcePropertyNamesFrom (metadata) {
        return metadata.propertyKeys.filter(name => metadata.properties[metadata.baseName(name)].type !== 'geometry');
    }

    _getPropertyNamesFrom (metadata) {
        const propertyNames = [];
        this._getSourcePropertyNamesFrom(metadata).forEach(sourceName => {
            metadata.decodedProperties(sourceName).forEach(propertyName => {
                propertyNames.push(propertyName);
            });
        });
        return propertyNames;
    }

    _getPropertiesFor (propertyNames, length) {
        const properties = {};
        const size = Math.ceil(length / RTT_WIDTH) * RTT_WIDTH;

        const arrayBuffer = new ArrayBuffer(4 * size * propertyNames.length);
        const propertiesArrayBuffer = arrayBuffer;
        for (let i = 0; i < propertyNames.length; i++) {
            const propertyName = propertyNames[i];
            properties[propertyName] = new Float32Array(arrayBuffer, i * 4 * size, size);
        }

        return { properties, propertiesArrayBuffer };
    }

    _scalarPropertyCodecs (metadata) {
        return this._getSourcePropertyNamesFrom(metadata)
            .map(prop => [prop, metadata.codec(prop)])
            .filter(([_, codec]) => !codec.isRange());
    }

    _rangePropertyCodecs (metadata) {
        return this._getSourcePropertyNamesFrom(metadata)
            .map(prop => [prop, metadata.decodedProperties(prop), metadata.codec(prop)])
            .filter(([_prop, _dprop, codec]) => codec.isRange());
    }

    _decodeProperties (metadata, scalarPropertyCodecs, rangePropertyCodecs, properties, feature, i) {
        let length = scalarPropertyCodecs.length;
        for (let j = 0; j < length; j++) {
            const [propertyName, codec] = scalarPropertyCodecs[j];
            const propertyValue = (propertyName === DEFAULT_ID_PROPERTY)
                ? feature.id
                : feature.properties[propertyName];
            properties[propertyName][i] = codec.sourceToInternal(metadata, propertyValue);
        }

        length = rangePropertyCodecs.length;
        for (let j = 0; j < length; j++) {
            const [propertyName, [loPropertyName, hiPropertyName], codec] = rangePropertyCodecs[j];
            const propertyValue = feature.properties[propertyName];
            const [loValue, hiValue] = codec.sourceToInternal(metadata, propertyValue);
            properties[loPropertyName][i] = loValue;
            properties[hiPropertyName][i] = hiValue;
        }
    }

    _generateDataFrame (rs, geometry, properties, propertiesArrayBuffer, size, type, metadata, x, y, z) {
        return new DummyDataframe({
            active: false,
            center: rs.center,
            geom: geometry,
            properties: properties,
            propertiesArrayBuffer: propertiesArrayBuffer,
            scale: rs.scale,
            size: size,
            type: type,
            metadata,
            x,
            y,
            z
        });
    }
}
