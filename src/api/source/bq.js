import * as R from '../../core/renderer';
import * as rsys from '../../client/rsys';
import Property from '../../core/style/expressions/property';
import * as LRU from 'lru-cache';

const PROPERTIES = ['feature_count', 'total_amount', 'trip_distance'];


const DEG2RAD = Math.PI / 180;
const EARTH_RADIUS = 6378137;
const WM_R = EARTH_RADIUS * Math.PI; // Webmercator *radius*: half length Earth's circumference
const WM_2R = WM_R * 2; // Webmercator coordinate range (Earth's circumference)

// Webmercator projection
function Wmxy(latLng) {
    let lat = latLng.lat * DEG2RAD;
    let lng = latLng.lng * DEG2RAD;
    let x = lng * EARTH_RADIUS;
    let y = Math.log(Math.tan(lat / 2 + Math.PI / 4)) * EARTH_RADIUS;
    return { x, y };
}

function fetchFromServer(url) {
    return fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(response => response.json());
}

function fetchDataframe(url) {
    return fetchFromServer(url).then(data => {
        const numFeatures = data.length;
        // console.log(numFeatures);
        const geometry = new Float32Array(numFeatures * 2);
        const properties = {};
        PROPERTIES.map(prop => properties[prop] = new Float32Array(numFeatures + 1024))
        // the target coordsys is not tile relative but world relative; since the mapping from long,lat is anisotropic,
        // we'll go through Webmercator
        const tsys = { scale: WM_2R/2, center: { x: 0, y: 0 } };

        for (let i = 0; i < numFeatures; i++) {
            const f = data[i];
            const lng = f.pickup_longitude;
            const lat = f.pickup_latitude;
            const wm = Wmxy({ lat, lng });
            const r = rsys.wToR(wm.x, wm.y, tsys);
            geometry[2 * i + 0] = r.x;
            geometry[2 * i + 1] = r.y;
            PROPERTIES.map(prop => properties[prop][i] = f[prop]);
        }
        const dataframe = new R.Dataframe(
            { x: 0, y: 0 },
            1,
            geometry,
            properties,
        );
        dataframe.type = 'point';
        dataframe.active = true;
        dataframe.size = numFeatures;
        return dataframe;
    });
}

var previewDataframe = null;

export default class BQ {
    constructor(table, auth) {
        const query = `SELECT *, 2000 AS feature_count FROM ${table}_sample`
        this.sample = new carto.source.SQL(query, auth);

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

        this.cache = LRU(lruOptions);
    }

    bindLayer(addDataframe, removeDataframe) {
        this._addDataframe = addDataframe;
        this._removeDataframe = removeDataframe;
        this.sample.bindLayer(addDataframe, removeDataframe)
    }

    requestData(viewport, mns, resolution) {
        if (!this.metadataInit) {
            this.metadataInit = true;
            // relay to preview data
            const previewMeta = this.sample.requestData(viewport, mns, resolution);
            const realMeta = fetchFromServer('http://localhost:3000/metadata/')
            return previewMeta;
        }
        else if (!this.dataInit) {
            const tiles = rsys.rTiles(viewport);
            // while we wait, provide some preview data
            this.sample.requestData(viewport, mns, resolution);
            tiles.forEach(t => this._getDataframe(t.x, t.y, t.z));
        }
    }

    _getDataframe(x, y, z) {
        const id = `${x},${y},${z}`;
        const c = this.cache.get(id);
        if (c) {
            // c.then(dataframe => dataframe.active = true);
            return c;
        }
        const promise = fetchDataframe(`http://localhost:3000/tile/${z}/${x}/${y}`).then(dataframe => {
                console.log("DATAFRAME",x,y,z)
                this.sample._client.deactivate(x, y, z)
                // this.sample._client.remove(t.x, t.y, t.z)
                this._addDataframe(dataframe);
        });

        this.cache.set(id, promise);
        return promise;
    }


    free() {
        this._client.free();
        this.cache.reset();
        this.sample.free();
    }
}
