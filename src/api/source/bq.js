import * as R from '../../core/renderer';
import * as rsys from '../../client/rsys';
import Property from '../../core/style/expressions/property';

const PROPERTY = 'amount';


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
    return { x: x, y: y };
}

export default class BQ {
    constructor() {
    }

    bindLayer(addDataframe, removeDataframe) {
        this._addDataframe = addDataframe;
        this._removeDataframe = removeDataframe;
    }

    requestData(viewport, mns, resolution) {
        if (!this.metadataInit) {
            this.metadataInit = true;
            return new Promise(resolve => {
                resolve({
                    featureCount: 1000,
                    columns: [],
                });
            });
        } else if (!this.dataInit) {

            fetch('http://localhost:3000/', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                // mode: 'no-cors'
            }).then(response => {
                response.json().then(result => {
                    console.log("-----")
                    console.log(result);
                    const geometry = new Float32Array(result);
                    const properties = [];
                    const dataframe = new R.Dataframe(
                        { x: 0, y: 0 },
                        1,
                        geometry,
                        properties,
                    );
                    dataframe.type = 'point';
                    dataframe.active = true;
                    dataframe.size = 3;
                    this._addDataframe(dataframe);
                    this.dataInit = true;
                });
            });
        }
    }

    requestData(viewport, mns, resolution) {
        if (!this.metadataInit) {
            this.metadataInit = true;

            let names = [];
            let counts = [];
            let map = {};

            return fetch('http://localhost:3000/metadata/', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json());

        } else if (!this.dataInit) {

            fetch('http://localhost:3000/', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                // mode: 'no-cors'
            }).then(response => {
                response.json().then(data => {
                    const numFeatures = data.length;
                    console.log(numFeatures);
                    const geometry = new Float32Array(numFeatures * 2);
                    const properties = {};
                    properties[PROPERTY] = new Float32Array(numFeatures + 1024);
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
                        properties[PROPERTY][i] = f[PROPERTY];
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
                    console.log(123);
                    this._addDataframe(dataframe);
                    this.dataInit = true;
                });
            });


        }
    }


    free() {
        this._client.free();
    }
}
