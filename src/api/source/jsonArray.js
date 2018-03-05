import * as R from '../../core/renderer';
import * as rsys from '../../client/rsys';
import Property from '../../core/style/expressions/property';


const DEG2RAD = Math.PI / 180;
const EARTH_RADIUS = 6378137;
const WM_R = EARTH_RADIUS * Math.PI; // Webmercator *radius*: half length Earth's circumference
const WM_2R = WM_R * 2; // Webmercator coordinate range (Earth's circumference)

const PROPERTY = 'BillingCity';

// Webmercator projection
function Wmxy(latLng) {
    let lat = latLng.lat * DEG2RAD;
    let lng = latLng.lng * DEG2RAD;
    let x = lng * EARTH_RADIUS;
    let y = Math.log(Math.tan(lat / 2 + Math.PI / 4)) * EARTH_RADIUS;
    return { x: x, y: y };
}


export default class JSON {
    constructor(data) {
        this.data = data;
        this._categoryStringToIDMap = {};
        this._numCategories = 0;
    }

    bindLayer(addDataframe, removeDataframe) {
        this._addDataframe = addDataframe;
        this._removeDataframe = removeDataframe;
    }
    _getCategoryIDFromString(category) {
        if (this._categoryStringToIDMap[category]) {
            return this._categoryStringToIDMap[category];
        }
        this._numCategories++;
        this._categoryStringToIDMap[category] = this._numCategories;
        return this._numCategories;
    }
    requestData() {
        if (!this.metadataInit) {
            this.metadataInit = true;
            return new Promise(resolve => {
                let metadata = {
                    featureCount: 1000,
                    columns: [
                        {
                            name: 'count',
                            type: 'float',
                        }
                    ],
                    categoryIDs: {},
                };
                console.log(metadata);
                resolve(metadata);
            });
        } else if (!this.dataInit) {
            const numFeatures = this.data.length;
            console.log(numFeatures);
            const geometry = new Float32Array(numFeatures * 2);
            const properties = {};
            properties['count'] = new Float32Array(numFeatures + 1024);
            const center = [-74.0060, 40.7128];
            const wmc = Wmxy({ lng: center[0], lat: center[1] });

            const s = 1;
            for (let i = 2; i < numFeatures; i++) {
                const f = this.data[i];
                const lat = f[1];
                const lng = f[0];
                const wm = Wmxy({ lat, lng });
                wm.x-=wmc.x;
                wm.y-=wmc.y;
                const r = rsys.wToR(wm.x, wm.y, { scale: WM_R, center: { x: 0, y: 0 } });
                geometry[2 * i + 0] = r.x/s;
                geometry[2 * i + 1] = r.y/s;
                properties['count'][i] = this._getCategoryIDFromString(f[3]);
            }
            const dataframe = new R.Dataframe(
                rsys.wToR(wmc.x, wmc.y, { scale: WM_R, center: { x: 0, y: 0 } }),
                s,
                geometry,
                properties,
            );
            dataframe.type = 'point';
            dataframe.active = true;
            dataframe.size = numFeatures;
            console.log(123);
            this._addDataframe(dataframe);
            this.dataInit = true;
        }
    }

    free() {
        this._client.free();
    }
}