import * as rsys from '../client/rsys';
import Dataframe from '../renderer/Dataframe';
import Metadata from '../renderer/Metadata';
// import CartoValidationError, { CartoValidationTypes as cvt } from '../errors/carto-validation-error';
// import CartoRuntimeError, { CartoRuntimeTypes as crt } from '../errors/carto-runtime-error';
import util from '../utils/util';
import Base from './Base';
import schema from '../renderer/schema';

// const SAMPLE_TARGET_SIZE = 1000;

const DEFAULT_SRID = 4326;
const SUPPORTED_SRIDS = [3857, 4326];
const WM_LAT_LIMIT = 85.051128779806592;

function adjustGrid (grid) {
    grid.srid = grid.srid || DEFAULT_SRID;
    if (!SUPPORTED_SRIDS.includes(grid.srid)) {
        throw new Error(`Unsupported grid srid ${grid.srid}`);
    }
    let [xmin, ymin, xmax, ymax] = grid.bbox;
    if (grid.srid === 4326 && (ymin < -WM_LAT_LIMIT || ymax > WM_LAT_LIMIT)) {
        if (ymax < -WM_LAT_LIMIT || ymin > WM_LAT_LIMIT) {
            throw new Error('Grid is completely out of Web-Mercator area');
        }

        // The grid must be cropped vertically and an offset.
        // TODO: it would be more efficient
        // (and more precise, since it avoids whole pixel cropping)
        // to retain the original band data and use some offset
        // to access pixels (or perhaps to compute UV coordinates)
        let height = grid.height;
        const width = grid.width;
        const pixelHeight = (ymax - ymin) / height;
        let firstRow = 0;
        let lastRow = height - 1;

        if (ymax > WM_LAT_LIMIT) {
            const n = Math.ceil((ymax - WM_LAT_LIMIT) / pixelHeight);
            // remove n rows from the top (N) of the grid
            firstRow += n;
            height -= n;
            ymax -= n * pixelHeight;
        }
        if (ymin < -WM_LAT_LIMIT) {
            const n = Math.ceil((-ymin - WM_LAT_LIMIT) / pixelHeight);
            // remove n rows from the bottom (S) of the grid
            lastRow -= n;
            height -= n;
            ymin += n * pixelHeight;
        }
        grid = {
            srid: grid.srid,
            bbox: [xmin, ymin, xmax, ymax],
            width,
            height,
            // TODO: be more lazy so that we don't need to slice unused bands
            // and avoid slicing then casting. This could be done at _adaptDataBand
            data: grid.data.map(band => band.slice(firstRow * width, (lastRow + 1) * width))
        };
    }
    return grid;
}

export default class Grid extends Base {
    /**
     * Create a carto.source.Grid source from a GeoTIFF file
     *
     * @param {string} url - A URL pointing to a GeoTIFF file
     *
     * @fires CartoError
     *
     * @constructor Grid
     * @extends carto.source.Base
     * @memberof carto.source
     * @api
     */
    constructor (grid) {
        super();
        this._grid = adjustGrid(grid);
        this._gridFields = new Set();
        this._properties = {};
        this._setCoordinates();
    }

    // sets this._center, this._gridCenter and this._size
    _setCoordinates () {
        this._srid = this._grid.srid;
        const [xmin, ymin, xmax, ymax] = this._grid.bbox;

        this._sridBounds = {
            xMin: xmin,
            yMin: ymin,
            xMax: xmax,
            yMax: ymax
        };
        const [wmXmin, wmYmin] = this._webMercator(xmin, ymin);
        const [wmXmax, wmYmax] = this._webMercator(xmax, ymax);
        this._wmBounds = {
            xMin: wmXmin,
            yMin: wmYmin,
            xMax: wmXmax,
            yMax: wmYmax
        };

        this._center = {
            x: (wmXmin + wmXmax) / 2.0,
            y: (wmYmin + wmYmax) / 2.0
        };

        this._gridCenter = this._webMercatorToR(this._center.x, this._center.y);

        const lowerLeft = this._webMercatorToR(wmXmin, wmYmin);
        const upperRight = this._webMercatorToR(wmXmax, wmYmax);
        this._gridSize = {
            width: upperRight.x - lowerLeft.x,
            height: upperRight.y - lowerLeft.y
        };
    }

    _webMercatorToR (x, y) {
        return rsys.wToR(x, y, { scale: util.WM_R, center: { x: 0, y: 0 } });
    }

    _webMercator (x, y) {
        if (this._srid === 4326) {
            const wm = util.projectToWebMercator({ lng: x, lat: y });
            return [wm.x, wm.y];
        }
        return [x, y];
    }

    requestData () {
        if (this._dataframe) {
            // const newProperties = this._decodeUnboundProperties();
            // this._dataframe.addProperties(newProperties);
            // Object.keys(newProperties).forEach(propertyName => {
            //     this._boundColumns.add(propertyName);
            // });
            return;
        }
        const dataframe = this._buildDataFrame();
        // this._boundBands = new Set(Object.keys(dataframe.properties));
        this._dataframe = dataframe;
        this._addDataframe(dataframe);
        this._dataLoadedCallback();
    }

    _buildDataFrame () {
        let df = new Dataframe({
            active: true,
            center: { x: 0, y: 0 },
            geom: this._getGeometry(),
            properties: this._getProperties(),
            scale: 1,
            // size: this._features.length,
            type: 'grid',
            metadata: this._metadata
        });
        // extra options
        df.gridSize = this._gridSize;
        df.gridWidth = this._grid.width;
        df.gridHeight = this._grid.height;
        df.gridSRID = this._srid;
        df.gridBounds = this._sridBounds;
        df.gridBoundsWM = this._wmBounds;
        df.gridCenter = this._gridCenter;
        return df;
    }

    bindLayer (addDataframe, dataLoadedCallback) {
        this._addDataframe = addDataframe;
        this._dataLoadedCallback = dataLoadedCallback;
    }

    requestMetadata (viz) {
        return Promise.resolve(this._computeMetadata(viz));
    }

    requiresNewMetadata () {
        return false;
    }

    _clone () {
        return this;
    }

    _getGeometry () {
        // const [xmin, ymin, xmax, ymax] = this._grid.bbox;

        // These are texture coordinates... not refering to WebMercator, nor WebGL space
        const coordinates = new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0]
        );
        return coordinates;
    }

    _adaptDataBand (band) {
        // TODO:
        // here we could convert the band to 4 components (RGBA) is LINEAR filtering is desired,
        // and pad the band to power of two dimensions to use MIP mapping.
        if (band instanceof Float32Array) {
            return band;
        }
        return new Float32Array(band);
    }

    _getPropertyIndex (name) {
        const match = name.match(/^band(\d+)$/);
        if (!match) {
            throw new Error(`Property name "${name}" is not a valid Grid band name`);
        }
        return Number(match[1]);
    }

    _getProperties () {
        const properties = {};
        const data = this._grid.data;
        Object.keys(this._metadata.properties).forEach(name => {
            const i = this._getPropertyIndex(name);
            properties[name] = this._adaptDataBand(data[i]);
        });
        return properties;
    }

    _computeMetadata (viz) {
        if (this._grid && this._grid.data) {
            const data = this._grid.data;
            const requiredColumns = new Set(Object.keys(schema.simplify(viz.getMinimumNeededSchema())));
            for (let i = 0; i < data.length; i++) {
                const propName = `band${i}`;
                if (requiredColumns.has(propName)) {
                    this._addGridProperty(`band${i}`);
                }
            }
        }

        this._metadata = new Metadata({
            properties: this._properties,
            featureCount: 0,
            sample: [],
            geomType: 'grid',
            isAggregated: false,
            idProperty: ''
        });

        return this._metadata;
    }

    _addGridProperty (propertyName) {
        if (!this._gridFields.has(propertyName)) {
            this._gridFields.add(propertyName);
            this._properties[propertyName] = {
                type: 'number',
                min: Number.POSITIVE_INFINITY,
                max: Number.NEGATIVE_INFINITY,
                avg: Number.NaN,
                sum: 0,
                count: 0,
                isLngLat: this._srid === 4326
            }; // TODO metadata stats
        }
    }

    free () {
    }
}
