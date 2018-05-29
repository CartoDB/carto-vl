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

    async requestMetadata(viz) {
        this._MNS = viz.getMinimumNeededSchema();
        this._resolution = viz.getResolution;
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
                const numFields = [];
                const jsonFields = [];
                const stringFields = [];
                this.metadata.columns.map(c => {
                    const type = c.type;
                    if (type == 'json') {
                        jsonFields.push(c.name);
                    } else if (type == 'number') {
                        numFields.push(c.name);
                    } else if (type == 'category') {
                        stringFields.push(c.name);
                    } else {
                        throw new Error(`Column type '${type}' not supported`);
                    }

                });
                numFields.map((name, i) => fieldMap[name] = i);
                jsonFields.map((name, i) => fieldMap[name] = i + numFields.length);
                stringFields.map((name, i) => fieldMap[name] = i + jsonFields.length);

                const { points, featureGeometries, properties, geomType } = this._decodeMVTLayer(mvtLayer, mvt_extent, this._MNS, jsonFields, numFields, stringFields, fieldMap);
                this.metadata.geomType = geomType;

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
            let hole = false;
            if (this._isClockWise(geom[j])) {
                if (polygon) {
                    geometry.push(polygon);
                }
                polygon = {
                    flat: [],
                    holes: [],
                    clipped: [],
                    clippedType: [], // Store a bitmask of the clipped half-planes
                };
            } else {
                if (j == 0) {
                    console.log('Invalid MVT tile: first polygon ring MUST be external');
                    continue;
                    //throw new Error('Invalid MVT tile: first polygon ring MUST be external');
                }
                hole = true;
            }
            let preClippedVertices = [];
            for (let k = 0; k < geom[j].length; k++) {
                let x = geom[j][k].x;
                let y = geom[j][k].y;
                x = 2 * x / mvt_extent - 1;
                y = 2 * (1 - y / mvt_extent) - 1;
                preClippedVertices.push([x, y]);
            }
            this._clipPolygon(preClippedVertices, polygon, hole);
        }
        //if current polygon is not empty=> push it
        if (polygon) {
            geometry.push(polygon);
        }
        featureGeometries.push(geometry);
    }

    // Add polygon composed by preClippedVertices to the `polygon.flat` array
    _clipPolygon(preClippedVertices, polygon, isHole) {
        // Sutherland-Hodgman Algorithm to clip polygons to the tile
        // https://www.cs.drexel.edu/~david/Classes/CS430/Lectures/L-05_Polygons.6.pdf
        const clippingEdges = [
            p => p[0] <= 1,
            p => p[1] <= 1,
            p => p[0] >= -1,
            p => p[1] >= -1,
        ];
        const clippingEdgeIntersectFn = [
            (a, b) => this._intersect(a, b, [1, -10], [1, 10]),
            (a, b) => this._intersect(a, b, [-10, 1], [10, 1]),
            (a, b) => this._intersect(a, b, [-1, -10], [-1, 10]),
            (a, b) => this._intersect(a, b, [-10, -1], [10, -1]),
        ];

        // for each clipping edge
        for (let i = 0; i < 4; i++) {
            const preClippedVertices2 = [];

            // for each edge on polygon
            for (let k = 0; k < preClippedVertices.length - 1; k++) {
                // clip polygon edge
                const a = preClippedVertices[k];
                const b = preClippedVertices[k + 1];

                const insideA = clippingEdges[i](a);
                const insideB = clippingEdges[i](b);

                if (insideA && insideB) {
                    // case 1: both inside, push B vertex
                    preClippedVertices2.push(b);
                } else if (insideA) {
                    // case 2: just A outside, push intersection
                    const intersectionPoint = clippingEdgeIntersectFn[i](a, b);
                    preClippedVertices2.push(intersectionPoint);
                } else if (insideB) {
                    // case 4: just B outside: push intersection, push B
                    const intersectionPoint = clippingEdgeIntersectFn[i](a, b);
                    preClippedVertices2.push(intersectionPoint);
                    preClippedVertices2.push(b);
                } else {
                    // case 3: both outside: do nothing
                }
            }
            if (preClippedVertices2.length) {
                preClippedVertices2.push(preClippedVertices2[0]);
            }
            preClippedVertices = preClippedVertices2;
        }

        if (preClippedVertices.length > 3) {
            if (isHole) {
                polygon.holes.push(polygon.flat.length / 2);
            }
            preClippedVertices.forEach(v => {
                polygon.flat.push(v[0], v[1]);
            });
        }
    }
    _intersect(a, b, c, d) {
        //If AB intersects CD => return intersection point
        // Intersection method from Real Time Rendering, Third Edition, page 780
        const o1 = a;
        const o2 = c;
        const d1 = sub(b, a);
        const d2 = sub(d, c);
        const d1t = perpendicular(d1);
        const d2t = perpendicular(d2);

        const s = dot(sub(o2, o1), d2t) / dot(d1, d2t);
        const t = dot(sub(o1, o2), d1t) / dot(d2, d1t);

        if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
            // Intersects!
            return [o1[0] + s * d1[0], o1[1] + s * d1[1]];
        }
        // Doesn't intersects
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

    _decodeMVTLayer(mvtLayer, mvt_extent, MNS, jsonFields, numFields, stringFields, fieldMap) {
        const properties = [];
        this.metadata.columns.map(c => {
            var e = null;
            if (c.type == 'number') {
                e = new Float32Array(mvtLayer.length + 1024);
            } else if (c.type == 'json') {
                e = {};
            } else if (c.type == 'category') {
                e = {};
            }
            properties[fieldMap[c.name]] = e;
        });
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

            // TODO check number of properties received and send error if not all the defined
            // properties are being received
            this.metadata.columns.map(c => {
                var e = null;
                if (c.type === 'number') {
                    e = Number(f.properties[c.name]);
                } else if (c.type == 'json') {
                    e = JSON.parse(f.properties[c.name]);
                } else if (c.type == 'category') {
                    e = f.properties[c.name];
                }
                properties[fieldMap[c.name]][i] = e;
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
}

function sub([ax, ay], [bx, by]) {
    return ([ax - bx, ay - by]);
}
function dot([ax, ay], [bx, by]) {
    return (ax * bx + ay * by);
}
function perpendicular([x, y]) {
    return [-y, x];
}
