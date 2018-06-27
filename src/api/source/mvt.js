import * as rsys from '../../client/rsys';
import Dataframe from '../../core/dataframe';
import * as Protobuf from 'pbf';
import { VectorTile } from '@mapbox/vector-tile';
import { decodeLines, decodePolygons } from '../../client/mvt/feature-decoder';
import TileClient from './TileClient';
import Base from './base';
import { RTT_WIDTH } from '../../core/renderer';
import Metadata from '../../core/metadata';

// Constants for '@mapbox/vector-tile' geometry types, from https://github.com/mapbox/vector-tile-js/blob/v1.3.0/lib/vectortilefeature.js#L39
const mvtDecoderGeomTypes = { point: 1, line: 2, polygon: 3 };

const geometryTypes = {
    UNKNOWN: 'unknown',
    POINT: 'point',
    LINE: 'line',
    POLYGON: 'polygon'
};

export default class MVT extends Base {

    /**
     * Create a carto.source.MVT.
     *
     * @param {object} data - A MVT data object
     * @param {object} [metadata] - A carto.source.mvt.Metadata object
     * @param {string} [layerId] - layerID on the MVT tiles to decode, the parameter is optional if the MVT tiles only contains one layer
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
     * @IGNOREapi
     */
    constructor(templateURL, metadata = new Metadata(), layerId = undefined) {
        super();
        this._templateURL = templateURL;
        this._metadata = metadata;
        this._tileClient = new TileClient(templateURL);
        this._layerID = layerId;
    }

    _clone() {
        return new MVT(this._templateURL, JSON.parse(JSON.stringify(this._metadata)), this._layerID);
    }

    bindLayer(addDataframe, dataLoadedCallback) {
        this._tileClient.bindLayer(addDataframe, dataLoadedCallback);
    }

    async requestMetadata() {
        return this._metadata;
    }

    requestData(viewport) {
        return this._tileClient.requestData(viewport, this.responseToDataframeTransformer.bind(this));
    }

    async responseToDataframeTransformer(response, x, y, z) {
        const MVT_EXTENT = 4096;
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength == 0 || response == 'null') {
            return { empty: true };
        }
        const tile = new VectorTile(new Protobuf(arrayBuffer));

        if (Object.keys(tile.layers).length > 1 && !this._layerID) {
            throw new Error(`LayerID parameter wasn't specified and the MVT tile contains multiple layers: ${JSON.stringify(Object.keys(tile.layers))}`);
        }

        const mvtLayer = tile.layers[this._layerID || Object.keys(tile.layers)[0]];

        if (!mvtLayer) {
            throw new Error(`LayerID '${this._layerID}' doesn't exist on the MVT tile`);
        }

        const { points, featureGeometries, properties } = this._decodeMVTLayer(mvtLayer, this._metadata, MVT_EXTENT);


        const rs = rsys.getRsysFromTile(x, y, z);
        const dataframeGeometry = this._metadata.geomType == geometryTypes.POINT ? points : featureGeometries;
        const dataframe = this._generateDataFrame(rs, dataframeGeometry, properties, mvtLayer.length, this._metadata.geomType);
        return dataframe;
    }


    _decodeMVTLayer(mvtLayer, metadata, mvt_extent) {
        let points;
        if (metadata.geomType == geometryTypes.POINT) {
            points = new Float32Array(mvtLayer.length * 2);
        }
        let featureGeometries = [];
        const decodedProperties = {};
        const decodingPropertyNames = Object.keys(metadata.properties).
            filter(propertyName => metadata.properties[propertyName].type != 'geometry').
            map(propertyName => metadata.properties[propertyName].sourceName || propertyName);
        decodingPropertyNames.forEach(propertyName => {
            decodedProperties[propertyName] = new Float32Array(mvtLayer.length + RTT_WIDTH);
        });
        for (let i = 0; i < mvtLayer.length; i++) {
            const f = mvtLayer.feature(i);
            const geom = f.loadGeometry();
            const mvtGeomType = f.type;
            if (metadata.geomType === undefined) {
                switch (mvtGeomType) {
                    case mvtDecoderGeomTypes.point:
                        metadata.geomType = geometryTypes.POINT;
                        break;
                    case mvtDecoderGeomTypes.line:
                        metadata.geomType = geometryTypes.LINE;
                        break;
                    case mvtDecoderGeomTypes.polygon:
                        metadata.geomType = geometryTypes.POLYGON;
                        break;
                    default:
                        throw new Error('MVT: invalid geometry type');
                }
                if (metadata.geomType == geometryTypes.POINT) {
                    points = new Float32Array(mvtLayer.length * 2);
                }
            }
            if (metadata.geomType == geometryTypes.POINT) {
                points[2 * i + 0] = 2 * (geom[0][0].x) / mvt_extent - 1.;
                points[2 * i + 1] = 2 * (1. - (geom[0][0].y) / mvt_extent) - 1.;
            } else if (metadata.geomType == geometryTypes.POLYGON) {
                const decodedPolygons = decodePolygons(geom, mvt_extent);
                featureGeometries.push(decodedPolygons);
            } else if (metadata.geomType == geometryTypes.LINE) {
                const decodedLines = decodeLines(geom, mvt_extent);
                featureGeometries.push(decodedLines);
            } else {
                throw new Error(`Unimplemented geometry type: '${metadata.geomType}'`);
            }
            decodingPropertyNames.forEach(propertyName => {
                const propertyValue = f.properties[propertyName];
                decodedProperties[propertyName][i] = this.decodeProperty(propertyName, propertyValue);
            });
        }
        return { properties: decodedProperties, points, featureGeometries };
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
