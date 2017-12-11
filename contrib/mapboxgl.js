
import * as sql_api from '../contrib/sql-api';
import * as R from '../src/index';

const DEG2RAD = Math.PI / 180;
const EARTH_RADIUS = 6378137;
const WM_R = EARTH_RADIUS * Math.PI; // Webmercator *radius*: half length Earth's circumference
const WM_2R = WM_R * 2; // Webmercator coordinate range (Earth's circumference)
const TILE_SIZE = 256;

class MGLIntegrator {
    constructor(map) {
        this.map = map;
        map.on('load', _ => {
            var cont = map.getCanvasContainer();
            var canvas = document.createElement('canvas')
            this.canvas = canvas;
            canvas.id = 'good';
            cont.appendChild(canvas)
            canvas.style.width = map.getCanvas().style.width;
            canvas.style.height = map.getCanvas().style.height;

            this.renderer = new R.Renderer(canvas);
            this.provider = new sql_api.SQL_API(this.renderer, this.style);
            this.provider.setQueries(...this.ships_WWI());
            this.provider.getSchema().then(schema => {
                this.schema = schema;
                this.style = new R.Style.Style(this.renderer, schema);
                this.provider.style = this.style;
                $('#styleEntry').on('input', this.updateStyle.bind(this));
                this.updateStyle();
                this.resize();
                this.move();
            });

            map.on('resize', this.resize.bind(this));
            map.on('movestart', this.move.bind(this));
            map.on('move', this.move.bind(this));
            map.on('moveend', this.move.bind(this));
        });
    }
    barcelona() {
        return [`(SELECT
            the_geom_webmercator,
            amount,
           category
        FROM tx_0125_copy_copy) AS tmp`
            ,
            (x, y, z) => `select st_asmvt(geom, 'lid') FROM
    (
        SELECT
            ST_AsMVTGeom(
                ST_SetSRID(ST_MakePoint(avg(ST_X(the_geom_webmercator)), avg(ST_Y(the_geom_webmercator))),3857),
                CDB_XYZ_Extent(${x},${y},${z}), 1024, 0, false
            ),
            SUM(amount) AS amount,
            _cdb_mode(category) AS category
        FROM tx_0125_copy_copy AS cdbq
        WHERE the_geom_webmercator && CDB_XYZ_Extent(${x},${y},${z})
        GROUP BY ST_SnapToGrid(the_geom_webmercator, CDB_XYZ_Resolution(${z})*0.25)
        ORDER BY amount DESC
    )AS geom`];
    }
    ships_WWI() {
        return [`(SELECT
                the_geom_webmercator,
                temp,
                DATE_PART('day', date::timestamp-'1912-12-31 01:00:00'::timestamp )::numeric AS day
            FROM wwi_ships) AS tmp`
            ,
            (x, y, z) => `select st_asmvt(geom, 'lid') FROM
        (
            SELECT
                ST_AsMVTGeom(
                    ST_SetSRID(ST_MakePoint(avg(ST_X(the_geom_webmercator)), avg(ST_Y(the_geom_webmercator))),3857),
                    CDB_XYZ_Extent(${x},${y},${z}), 1024, 0, false
                ),
                AVG(temp)::numeric(3,1) AS temp,
                DATE_PART('day', date::timestamp-'1912-12-31 01:00:00'::timestamp )::smallint AS day
            FROM wwi_ships AS cdbq
            WHERE the_geom_webmercator && CDB_XYZ_Extent(${x},${y},${z})
            GROUP BY ST_SnapToGrid(the_geom_webmercator, CDB_XYZ_Resolution(${z})*0.25),
                DATE_PART('day', date::timestamp-'1912-12-31 01:00:00'::timestamp )
        )AS geom
    `];
    }
    move() {
        var b = this.map.getBounds();
        var nw = b.getNorthWest();
        var c = this.map.getCenter();

        this.renderer.setCenter(c.lng / 180., Wmxy(c).y / WM_R);
        this.renderer.setZoom(this.getZoom());

        c = this.renderer.getCenter();
        var z = this.renderer.getZoom();
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
    setStyle(s) {
        document.getElementById("styleEntry").value = s;
        this.updateStyle();
    }
    updateStyle() {
        const v = document.getElementById("styleEntry").value;
        try {
            const s = R.Style.parseStyle(v, this.schema);
            this.style.set(s, 1000);
            document.getElementById("feedback").style.display = 'none';
        } catch (error) {
            const err = `Invalid width expression: ${error}:${error.stack}`;
            console.warn(err);
            document.getElementById("feedback").value = err;
            document.getElementById("feedback").style.display = 'block';
        }
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
