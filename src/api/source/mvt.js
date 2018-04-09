import Base from './base';
import CartoValidationError from '../error-handling/carto-validation-error';
import * as rsys from '../../client/rsys';
import Dataframe from '../../core/dataframe';
import * as util from '../util';
import * as Protobuf from 'pbf';
import * as LRU from 'lru-cache';
import { VectorTile, VectorTileFeature } from '@mapbox/vector-tile';

export default class MVT extends Base {

    /**
     * Create a carto.source.MVT.
     *
     * @param {object} data - A MVT data object
     *
     * @example
     * new carto.source.MVT("https://{server}/{z}/{x}/{y}.mvt");
     *
     * @fires CartoError
     *
     * @constructor MVT
     * @extends carto.source.Base
     * @memberof carto.source
     * @api
     */
    constructor(serverURL, metadata) {
        super();
        // this._validateServerURL(serverURL);
        this._serverURL = serverURL;
        this._oldDataframes = [];
        const lruOptions = {
            max: 1000
            // TODO improve cache length heuristic
            , length: function () { return 1; }
            , dispose: (key, promise) => {
                promise.then(dataframe => {
                    if (!dataframe.empty) {
                        dataframe.free();
                        this._removeDataframe(dataframe);
                    }
                });
            }
            , maxAge: 1000 * 60 * 60
        };
        this.metadata = metadata;
        this.cache = LRU(lruOptions);
    }

    _clone(){
        return new MVT(this._serverURL, this.metadata);
    }

    bindLayer(addDataframe, removeDataframe, dataLoadedCallback) {
        this._addDataframe = addDataframe;
        this._removeDataframe = removeDataframe;
        this._dataLoadedCallback = dataLoadedCallback;
    }

    async requestMetadata(style) {
        this._MNS = style.getMinimumNeededSchema();
        this._resolution = style.getResolution();
        return this.metadata;
    }

    requestData(viewport) {
        const tiles = rsys.rTiles(viewport);
        this._getTiles(tiles);
    }

    free() {
    }

    _getTiles(tiles) {
        var completedTiles = [];
        var needToComplete = tiles.length;
        tiles.forEach(t => {
            const { x, y, z } = t;
            this._getDataframe(x, y, z).then(dataframe => {
                if (dataframe.empty) {
                    needToComplete--;
                } else {
                    completedTiles.push(dataframe);
                }
                if (completedTiles.length == needToComplete) {
                    this._oldDataframes.map(d => d.active = false);
                    completedTiles.map(d => d.active = true);
                    this._oldDataframes = completedTiles;
                    this._dataLoadedCallback();
                }
            });
        });
    }

    _getDataframe(x, y, z) {
        const id = `${x},${y},${z}`;
        const c = this.cache.get(id);
        if (c) {
            return c;
        }
        const promise = this._requestDataframe(x, y, z);
        this.cache.set(id, promise);
        return promise;
    }

    _requestDataframe(x, y, z) {
        const mvt_extent = 4096;

        return fetch(this._getTileUrl(x, y, z))
            .then(rawData => rawData.arrayBuffer())
            .then(response => {

                if (response.byteLength == 0 || response == 'null') {
                    return { empty: true };
                }
                var tile = new VectorTile(new Protobuf(response));
                const mvtLayer = tile.layers[Object.keys(tile.layers)[0]];
                var fieldMap = {};
                this._MNS.columns.map((name, i) => fieldMap[name] = i);

                const { points, featureGeometries, properties, geomType } = this._decodeMVTLayer(mvtLayer, mvt_extent, this._MNS);

                var rs = rsys.getRsysFromTile(x, y, z);
                let dataframeProperties = {};
                Object.keys(fieldMap).map((name, pid) => {
                    dataframeProperties[name] = properties[pid];
                });
                let dataFrameGeometry = geomType == 'point' ? points : featureGeometries;
                const dataframe = this._generateDataFrame(rs, dataFrameGeometry, dataframeProperties, mvtLayer.length, geomType);
                this._addDataframe(dataframe);
                return dataframe;
            });
    }

    _getTileUrl(x, y, z) {
        return this._serverURL.replace('{x}', x).replace('{y}', y).replace('{z}', z);
    }

    _getSubdomain(x, y) {
        // Reference https://github.com/Leaflet/Leaflet/blob/v1.3.1/src/layer/tile/TileLayer.js#L214-L217
        return this._subdomains[Math.abs(x + y) % this._subdomains.length];
    }

    _decodePolygons(geom, featureGeometries, mvt_extent) {
        let polygon = null;
        let geometry = [];
        /*
            All this clockwise non-sense is needed because the MVT decoder dont decode the MVT fully.
            It doesn't distinguish between internal polygon rings (which defines holes) or external ones, which defines more polygons (mulipolygons)
            See:
                https://github.com/mapbox/vector-tile-spec/tree/master/2.1
                https://en.wikipedia.org/wiki/Shoelace_formula
        */
        for (let j = 0; j < geom.length; j++) {
            //if exterior
            //   push current polygon & set new empty
            //else=> add index to holes
            if (this._isClockWise(geom[j])) {
                if (polygon) {
                    geometry.push(polygon);
                }
                polygon = {
                    flat: [],
                    holes: []
                };
            } else {
                if (j == 0) {
                    throw new Error('Invalid MVT tile: first polygon ring MUST be external');
                }
                polygon.holes.push(polygon.flat.length / 2);
            }
            for (let k = 0; k < geom[j].length; k++) {
                polygon.flat.push(2 * geom[j][k].x / mvt_extent - 1.);
                polygon.flat.push(2 * (1. - geom[j][k].y / mvt_extent) - 1.);
            }
        }
        //if current polygon is not empty=> push it
        if (polygon && polygon.flat.length > 0) {
            geometry.push(polygon);
        }
        featureGeometries.push(geometry);
    }

    _decodeLines(geom, featureGeometries, mvt_extent) {
        let geometry = [];
        geom.map(l => {
            let line = [];
            l.map(point => {
                line.push(2 * point.x / mvt_extent - 1, 2 * (1 - point.y / mvt_extent) - 1);
            });
            geometry.push(line);
        });
        featureGeometries.push(geometry);
    }

    _decodeMVTLayer(mvtLayer, mvt_extent, MNS) {
        const properties = [];
        for (let i = 0; i < MNS.columns.length; i++) {
            properties.push(new Float32Array(mvtLayer.length + 1024));
        }
        var points = null;
        const geomType = VectorTileFeature.types[mvtLayer.feature(0).type].toLowerCase();
        let featureGeometries = [];
        for (var i = 0; i < mvtLayer.length; i++) {
            const f = mvtLayer.feature(i);
            const geom = f.loadGeometry();
            if (geomType == 'point') {
                if (points == null) {
                    points = new Float32Array(mvtLayer.length * 2);
                }
                points[2 * i + 0] = 2 * (geom[0][0].x) / mvt_extent - 1.;
                points[2 * i + 1] = 2 * (1. - (geom[0][0].y) / mvt_extent) - 1.;
            } else if (geomType == 'polygon') {
                this._decodePolygons(geom, featureGeometries, mvt_extent);
            } else if (geomType == 'line') {
                this._decodeLines(geom, featureGeometries, mvt_extent);
            } else {
                throw new Error(`Unimplemented geometry type: '${geomType}'`);
            }

            var index = 0;
            MNS.columns.map((name) => {
                //TODO decode f.properties[name] and check type
                properties[index][i] = Number(f.properties[name]);
                index++;
            });
        }

        return { properties, points, featureGeometries, geomType };
    }

    _computePointGeometry(data) {
        const lat = data[1];
        const lng = data[0];
        const wm = util.projectToWebMercator({ lat, lng });
        return rsys.wToR(wm.x, wm.y, { scale: util.WM_R, center: { x: 0, y: 0 } });
    }

    _computeLineStringGeometry(data) {
        let line = [];
        for (let i = 0; i < data.length; i++) {
            const point = this._computePointGeometry(data[i]);
            line.push(point.x, point.y);
        }
        return line;
    }

    _computeMultiLineStringGeometry(data) {
        let multiline = [];
        for (let i = 0; i < data.length; i++) {
            let line = this._computeLineStringGeometry(data[i]);
            if (line.length > 0) {
                multiline.push(line);
            }
        }
        return multiline;
    }

    _computePolygonGeometry(data) {
        let polygon = {
            flat: [],
            holes: []
        };
        let holeIndex = 0;
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                const point = this._computePointGeometry(data[i][j]);
                polygon.flat.push(point.x, point.y);
            }
            if (!this._isClockWise(data[i])) {
                if (i > 0) {
                    holeIndex += data[i - 1].length;
                    polygon.holes.push(holeIndex);
                } else {
                    throw new CartoValidationError('source', 'firstPolygonExternal');
                }
            }
        }
        return polygon;
    }

    _computeMultiPolygonGeometry(data) {
        let multipolygon = [];
        for (let i = 0; i < data.length; i++) {
            let polygon = this._computePolygonGeometry(data[i]);
            if (polygon.flat.length > 0) {
                multipolygon.push(polygon);
            }
        }
        return multipolygon;
    }

    _isClockWise(vertices) {
        let a = 0;
        for (let i = 0; i < vertices.length; i++) {
            let j = (i + 1) % vertices.length;
            a += vertices[i].x * vertices[j].y;
            a -= vertices[j].x * vertices[i].y;
        }
        return a < 0;
    }

    _generateDataFrame(rs, geometry, properties, size, type) {
        const dataframe = new Dataframe({
            active: false,
            center: rs.center,
            geom: geometry,
            properties: properties,
            scale: rs.scale,
            size: size,
            type: type,
            metadata: this.metadata,
        });

        return dataframe;
    }

    // _validateServerURL(serverURL) {
    //     var urlregex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
    //     if (!serverURL.match(urlregex)) {
    //         throw new CartoValidationError('source', 'nonValidServerURL');
    //     }
    // }
}
