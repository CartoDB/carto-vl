import * as rsys from '../../client/rsys';
import util from '../../utils/util';

/**
 * Helper class to transform geometry coordinates from a GeoJSON.
 * It converts the original coordinates (Lng, Lat) to a rSys coords
 * (local reference system), using the 'center' parameter.
 *
 * RSys coords are in the range: -1 <= x <= +1; -1 <= y <= +1
 */
export default class GeoJSONGeometryTransformer {
    constructor (center) {
        this._center = center;
    }

    computePoint (data) {
        const lat = data[1];
        const lng = data[0];
        const wm = util.projectToWebMercator({ lat, lng });

        const targetReferenceSystem = {
            scale: util.WM_R,
            center: this._center /* */
        };

        return rsys.wToR(wm.x, wm.y, targetReferenceSystem);
    }

    computeLineString (data, reverse) {
        let line = [];
        for (let i = 0; i < data.length; i++) {
            const point = this.computePoint(
                data[reverse ? (data.length - i - 1) : i]
            );
            line.push(point.x, point.y);
        }
        return line;
    }

    computeMultiLineString (data) {
        let multiline = [];
        for (let i = 0; i < data.length; i++) {
            let line = this.computeLineString(data[i]);
            if (line.length > 0) {
                multiline.push(line);
            }
        }
        return multiline;
    }

    computePolygon (data) {
        let polygon = {
            flat: [],
            holes: [],
            clipped: []
        };
        let holeIndex = 0;
        let firstReverse = false;

        if (data.length) {
            firstReverse = this._isReversed(data[0]);
            const flat = this.computeLineString(data[0], firstReverse);
            polygon.flat = polygon.flat.concat(flat);
        }

        for (let i = 1; i < data.length; i++) {
            if (firstReverse !== this._isReversed(data[i])) {
                holeIndex += data[i - 1].length;
                polygon.holes.push(holeIndex);
            }
            const flat = this.computeLineString(data[i], firstReverse);
            polygon.flat = polygon.flat.concat(flat);
        }

        return polygon;
    }

    computeMultiPolygon (data) {
        let multipolygon = [];
        for (let i = 0; i < data.length; i++) {
            let polygon = this.computePolygon(data[i]);
            if (polygon.flat.length > 0) {
                multipolygon.push(polygon);
            }
        }
        return multipolygon;
    }

    _isReversed (vertices) {
        let total = 0;
        let pt1 = vertices[0];
        let pt2;
        for (let i = 0; i < vertices.length - 1; i++) {
            pt2 = vertices[i + 1];
            total += (pt2[1] - pt1[1]) * (pt2[0] + pt1[0]);
            pt1 = pt2;
        }
        // When total is positive it means that vertices are oriented clock wise
        // and, since positive orientation is counter-clock wise, it is reversed.
        return total >= 0;
    }
}
