import Geometry from './Geometry';

/**
 * A polygon used to detect collisions
 * https://github.com/Prozi/detect-collisions/
 */

export default class Polygon extends Geometry {
    constructor (x = 0, y = 0, points = [], angle = 0, scaleX = 1, scaleY = 1) {
        super(x, y);

        this.angle = angle;
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.isPolygon = true;

        this._x = x;
        this._y = y;
        this._angle = angle;
        this._scaleX = scaleX;
        this._scaleY = scaleY;
        this._minX = 0;
        this._minY = 0;
        this._maxX = 0;
        this._maxY = 0;
        this._points = null;
        this._coords = null;
        this._normals = null;
        this._dirtyCoords = true;
        this._dirtyNormals = true;

        this.setPoints(points);
    }

    /**
     * Sets the points making up the polygon. It's important to use this function when changing the polygon's shape to ensure internal data is also updated.
     */
    setPoints (newPoints) {
        const count = newPoints.length;

        this._points = new Float64Array(count * 2);
        this._coords = new Float64Array(count * 2);
        this._edges = new Float64Array(count * 2);
        this._normals = new Float64Array(count * 2);

        const points = this._points;

        for (let i = 0, ix = 0, iy = 1; i < count; ++i, ix += 2, iy += 2) {
            const newPoint = newPoints[i];

            points[ix] = newPoint[0];
            points[iy] = newPoint[1];
        }

        this._dirtyCoords = true;
    }

    /**
     * Calculates and caches the polygon's world coordinates based on its points, angle, and scale
     */
    _calculateCoords () {
        const x = this.x;
        const y = this.y;
        const angle = this.angle;
        const scaleX = this.scaleX;
        const scaleY = this.scaleY;
        const points = this._points;
        const coords = this._coords;
        const count = points.length;

        let minX;
        let maxX;
        let minY;
        let maxY;

        for (let ix = 0, iy = 1; ix < count; ix += 2, iy += 2) {
            let coordX = points[ix] * scaleX;
            let coordY = points[iy] * scaleY;

            [ coordX, coordY ] = _updateCoordsAngle(angle, coordX, coordY);

            coordX += x;
            coordY += y;

            coords[ix] = coordX;
            coords[iy] = coordY;

            [ minX, maxX, minY, maxY ] = _updateMinMax(ix, minX, maxX, minY, maxY, coordX, coordY);
        }

        this._x = x;
        this._y = y;
        this._angle = angle;
        this._scaleX = scaleX;
        this._scaleY = scaleY;
        this._minX = minX;
        this._minY = minY;
        this._maxX = maxX;
        this._maxY = maxY;
        this._dirtyCoords = false;
        this._dirtyNormals = true;
    }

    /**
     * Calculates the normals and edges of the polygon's sides
     */
    _calculateNormalsAndEdges () {
        const coords = this._coords;
        const edges = this._edges;
        const normals = this._normals;
        const count = coords.length;

        for (let ix = 0, iy = 1; ix < count; ix += 2, iy += 2) {
            const next = ix + 2 < count ? ix + 2 : 0;
            const x = coords[next] - coords[ix];
            const y = coords[next + 1] - coords[iy];
            const length = x || y ? Math.sqrt(x * x + y * y) : 0;

            edges[ix] = x;
            edges[iy] = y;
            normals[ix] = length ? y / length : 0;
            normals[iy] = length ? -x / length : 0;
        }

        this._dirtyNormals = false;
    }
}

function _updateCoordsAngle (angle, coordX, coordY) {
    if (angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const tmpX = coordX;
        const tmpY = coordY;

        coordX = tmpX * cos - tmpY * sin;
        coordY = tmpX * sin + tmpY * cos;
    }

    return [ coordX, coordY ];
}

function _updateMinMax (ix, minX, maxX, minY, maxY, coordX, coordY) {
    if (ix === 0) {
        minX = maxX = coordX;
        minY = maxY = coordY;

        return [ minX, maxX, minY, maxY ];
    }

    minX = coordX < minX ? coordX : minX;
    maxX = coordX > maxX ? coordX : maxX;
    minY = coordY < minY ? coordY : minY;
    maxY = coordY > maxY ? coordY : maxY;

    return [ minX, maxX, minY, maxY ];
}
