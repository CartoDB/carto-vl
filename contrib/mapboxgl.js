
import * as R from '../src/index';

const DEG2RAD = Math.PI / 180;
const EARTH_RADIUS = 6378137;
const WM_R = EARTH_RADIUS * Math.PI; // Webmercator *radius*: half length Earth's circumference
const WM_2R = WM_R * 2; // Webmercator coordinate range (Earth's circumference)

class MGLIntegrator {
    constructor(map, providerClass) {
        this.map = map;
        map.on('load', () => {
            var cont = map.getCanvasContainer();
            var canvas = document.createElement('canvas');
            this.canvas = canvas;
            canvas.id = 'good';
            cont.appendChild(canvas);
            canvas.style.width = map.getCanvas().style.width;
            canvas.style.height = map.getCanvas().style.height;

            this.renderer = new R.Renderer(canvas);
            this.provider = new providerClass(this.renderer, this.style);

            map.on('resize', this.resize.bind(this));
            map.on('movestart', this.move.bind(this));
            map.on('move', this.move.bind(this));
            map.on('moveend', this.move.bind(this));
            this.move();
        });
    }
    move() {
        var c = this.map.getCenter();

        this.renderer.setCenter(c.lng / 180.,Wmxy(c).y / WM_R);
        this.renderer.setZoom(this.getZoom());

        c = this.renderer.getCenter();
        this.getData(this.canvas.clientWidth / this.canvas.clientHeight);
    }

    resize() {
        this.canvas.style.width = this.map.getCanvas().style.width;
        this.canvas.style.height = this.map.getCanvas().style.height;
        this.move();
    }
    getData() {
        this.provider.getData();
    }
    getZoom() {
        var b = this.map.getBounds();
        var c = this.map.getCenter();
        var nw = b.getNorthWest();
        var sw = b.getSouthWest();
        var z = (Wmxy(nw).y - Wmxy(sw).y) / WM_2R;
        this.renderer.setCenter(c.lng / 180., Wmxy(c).y / WM_R);
        return z;
    }
}
export { MGLIntegrator };

// Webmercator projection
function Wmxy(latLng) {
    let lat = latLng.lat * DEG2RAD;
    let lng = latLng.lng * DEG2RAD;
    let x = lng * EARTH_RADIUS;
    let y = Math.log(Math.tan(lat / 2 + Math.PI / 4)) * EARTH_RADIUS;
    return { x: x, y: y };
}
