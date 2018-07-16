import { VectorTile } from '@mapbox/vector-tile';
import * as Protobuf from 'pbf';
import { decodeLines, decodePolygons } from '../client/mvt/feature-decoder';
import * as rsys from '../client/rsys';
import Dataframe from '../renderer/Dataframe';
import Metadata from '../renderer/Metadata';
import { RTT_WIDTH } from '../renderer/Renderer';
import Base from './Base';
import TileClient from './TileClient';

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

/**
 * A MVTOptions object declares a MVT configuration
 * @typedef {object} MVTOptions
 * @property {string} layerID - layerID on the MVT tiles to decode, the parameter is optional if the MVT tiles only contain one layer
 * @property {function} [viewportZoomToSourceZoom=Math.ceil] - function to transform the viewport zoom into a zoom value to replace `{z}` in the MVT URL template, undefined defaults to `Math.ceil`
 * @property {number} maxZoom - limit MVT tile requests to this zoom level, undefined defaults to no limit
 *
 * @example <caption>Use layer `myAwesomeLayer` and request tiles up to zoom level 12.</caption>
 * const options = {
 *     layerID: 'myAwesomeLayer',
 *     maxZoom: 12
 * };
 *
 * @example <caption>Use layer `myAwesomeLayer` and request tiles only at zoom levels 4, 5 and 6.</caption>
 * const options = {
 *     layerID: 'myAwesomeLayer',
 *     viewportZoomToSourceZoom: zoom => Math.min(Math.max(Math.ceil(zoom), 4), 6)
 * };
 *
 * @example <caption>Use layer `myAwesomeLayer` and request tiles only at zoom levels 0,3,6,9...</caption>
 * const options = {
 *     layerID: 'myAwesomeLayer',
 *     viewportZoomToSourceZoom: zoom => Math.round(zoom / 3) * 3
 * };
 *
 * @api
 */

export default class MVT extends Base {

    /**
     * Create a carto.source.MVT.
     *
     * @param {object} data - A MVT data object
     * @param {object} [metadata] - A carto.source.mvt.Metadata object
     * @param {MVTOptions} [options] - MVT source configuration, the default value will be valid for regular URL templates if the tiles are composed of only one layer
     *
     * @example
     * const metadata = new carto.source.mvt.Metadata([{ type: 'number', name: 'total_pop'}])
     * new carto.source.MVT("https://{server}/{z}/{x}/{y}.mvt", metadata);
     *
     * @fires CartoError
     *
     * @constructor MVT
     * @extends carto.source.Base
     * @memberof carto.source
     * @api
     */
    constructor(templateURL, metadata = new Metadata(), options = { layerId: undefined, viewportZoomToSourceZoom: Math.ceil, maxZoom: undefined }) {
        super();
        this._templateURL = templateURL;
        if (!(metadata instanceof Metadata)) {
            metadata = new Metadata(metadata);
        }
        this._metadata = metadata;
        this._tileClient = new TileClient(templateURL);
        this._options = options;
        this._options.viewportZoomToSourceZoom = this._options.viewportZoomToSourceZoom || Math.ceil;
    }

    _clone() {
        return new MVT(this._templateURL, JSON.parse(JSON.stringify(this._metadata)), this._options);
    }

    bindLayer(addDataframe, dataLoadedCallback) {
        this._tileClient.bindLayer(addDataframe, dataLoadedCallback);
    }

    async requestMetadata() {
        return this._metadata;
    }

    requestData(zoom, viewport) {
        return this._tileClient.requestData(zoom, viewport, this.responseToDataframeTransformer.bind(this),
            zoom => this._options.maxZoom == undefined ?
                this._options.viewportZoomToSourceZoom(zoom) :
                Math.min(this._options.viewportZoomToSourceZoom(zoom), this._options.maxZoom)
        );
    }

    async responseToDataframeTransformer(response, x, y, z) {
        const MVT_EXTENT = 4096;
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength == 0 || response == 'null') {
            return { empty: true };
        }
        const tile = new VectorTile(new Protobuf(arrayBuffer));

        if (Object.keys(tile.layers).length > 1 && !this._options.layerID) {
            throw new Error(`LayerID parameter wasn't specified and the MVT tile contains multiple layers: ${JSON.stringify(Object.keys(tile.layers))}`);
        }

        const mvtLayer = tile.layers[this._options.layerID || Object.keys(tile.layers)[0]];

        if (!mvtLayer) {
            throw new Error(`LayerID '${this._options.layerID}' doesn't exist on the MVT tile`);
        }

        const { geometries, properties, numFeatures } = this._decodeMVTLayer(mvtLayer, this._metadata, MVT_EXTENT);
        const rs = rsys.getRsysFromTile(x, y, z);
        const dataframe = this._generateDataFrame(rs, geometries, properties, numFeatures, this._metadata.geomType);

        return dataframe;
    }


    _decodeMVTLayer(mvtLayer, metadata, mvt_extent) {
        if (!mvtLayer.length) {
            return { properties: [], geometries: {}, numFeatures: 0 };
        }
        if (!metadata.geomType) {
            metadata.geomType = this._autoDiscoverType(mvtLayer);
        }
        switch (metadata.geomType) {
            case geometryTypes.POINT:
                return this._decode(mvtLayer, metadata, mvt_extent, new Float32Array(mvtLayer.length * 2));
            case geometryTypes.LINE:
                return this._decode(mvtLayer, metadata, mvt_extent, [], decodeLines);
            case geometryTypes.POLYGON:
                return this._decode(mvtLayer, metadata, mvt_extent, [], decodePolygons);
            default:
                throw new Error('MVT: invalid geometry type');
        }
    }

    _autoDiscoverType(mvtLayer) {
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

    _decode(mvtLayer, metadata, mvt_extent, geometries, decodeFn) {
        let numFeatures = 0;
        const { properties, propertyNames } = this._initializePropertyArrays(metadata, mvtLayer.length);
        for (let i = 0; i < mvtLayer.length; i++) {
            const f = mvtLayer.feature(i);
            this._checkType(f, metadata.geomType);
            const geom = f.loadGeometry();
            if (decodeFn) {
                const decodedPolygons = decodeFn(geom, mvt_extent);
                geometries.push(decodedPolygons);
            } else {
                const x = 2 * (geom[0][0].x) / mvt_extent - 1.;
                const y = 2 * (1. - (geom[0][0].y) / mvt_extent) - 1.;
                // Tiles may contain points in the border;
                // we'll avoid here duplicatend points between tiles by excluding the 1-edge
                if (x < -1 || x >= 1 || y < -1 || y >= 1) {
                    continue;
                }
                geometries[2 * numFeatures + 0] = x;
                geometries[2 * numFeatures + 1] = y;
            }
            if (f.properties[this._metadata.idProperty] === undefined) {
                throw new Error(`MVT feature with undefined idProperty '${this._metadata.idProperty}'`);
            }
            this._decodeProperties(propertyNames, properties, f, numFeatures);
            numFeatures++;
        }

        return { properties, geometries, numFeatures };
    }

    // Currently only mvtLayers with the same type in every feature are supported
    _checkType(feature, expected) {
        const type = feature.type;
        const actual = MVT_TO_CARTO_TYPES[type];
        if (actual !== expected) {
            throw new Error(`MVT: mixed geometry types in the same layer. Layer has type: ${expected} but feature was ${actual}`);
        }
    }

    _initializePropertyArrays(metadata, length) {
        const properties = {};
        const propertyNames = [];
        Object.keys(metadata.properties).
            filter(propertyName => metadata.properties[propertyName].type != 'geometry').
            forEach(propertyName => {
                propertyNames.push(...metadata.propertyNames(propertyName));
            });

        propertyNames.forEach(propertyName => properties[propertyName] = new Float32Array(length + RTT_WIDTH));

        return { properties, propertyNames };
    }

    _decodeProperties(propertyNames, properties, feature, i) {
        const length = propertyNames.length;
        for (let j = 0; j < length; j++) {
            const propertyName = propertyNames[j];
            const propertyValue = feature.properties[propertyName];
            properties[propertyName][i] = this.decodeProperty(propertyName, propertyValue);
        }
    }

    decodeProperty(propertyName, propertyValue) {
        if (typeof propertyValue === 'string') {
            return this._metadata.categorizeString(propertyValue);
        } else if (typeof propertyValue === 'number') {
            return propertyValue;
        } else if (propertyValue == null || propertyValue == undefined) {
            return Number.NaN;
        } else {
            throw new Error(`MVT decoding error. Feature property value of type '${typeof propertyValue}' cannot be decoded.`);
        }
    }

    _generateDataFrame(rs, geometry, properties, size, type) {
        return new Dataframe({
            active: false,
            center: rs.center,
            geom: geometry,
            properties: properties,
            scale: rs.scale,
            size: size,
            type: type,
            metadata: this._metadata,
        });
    }

    free() {
        this._tileClient.free();
    }
}
