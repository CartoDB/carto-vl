import Dataframe from '../renderer/Dataframe';
import MVTMetadata from './MVTMetadata';
import Base from './Base';
import TileClient from './TileClient';
import { GEOMETRY_TYPE } from '../utils/geometry';
import { decodePolygons } from '../client/mvt/feature-decoder';
import * as rsys from '../client/rsys';
// TODO import correctly
const RTT_WIDTH = 1024;
const MAX_ZOOM = 19;

const toXYZ = quadKey => {
    let x = 0;
    let y = 0;
    let z = quadKey.length;

    for (let i = z; i > 0; i--) {
        let mask = 1 << (i - 1);
        switch (quadKey[z - i]) {
            case '0':
                break;

            case '1':
                x |= mask;
                break;

            case '2':
                y |= mask;
                break;

            case '3':
                x |= mask;
                y |= mask;
                break;

            default:
                throw new Error('Invalid QuadKey digit sequence');
        }
    }
    return { x, y, z };
};

class CommonGridMetadata {
    constructor () {
        this.META = {
            addresses: {
                min: 0,
                max: 25
            },
            total_pop: {
                min: 0,
                max: 300
            }
        };
    }

    getMinMax (measurement, min = 0, max = 100) {
        return Object.assign(this.META[measurement] || {}, { min, max });
    }
}

export default class CommonGrid extends Base {
    constructor (measurements = ['addresses'], options = { serverURL: 'https://us-central1-cartodb-on-gcp-poc.cloudfunctions.net/tile?z={z}&x={x}&y={y}' }) {
        super();
        this.commonGridMetadata = new CommonGridMetadata();
        this._measurements = measurements;
        this._measurementsIndex = measurements.reduce((idx, m, i) => {
            idx[m] = i;
            return idx;
        }, {});
        const properties = measurements.reduce((props, m) => {
            props[m] = {
                type: 'number',
                min: this.commonGridMetadata.getMinMax(m).min,
                max: this.commonGridMetadata.getMinMax(m).max
            };
            return props;
        }, { id: { type: 'category' } });

        this._options = options;

        this._metadata = new MVTMetadata({
            idProperty: 'id',
            geomType: GEOMETRY_TYPE.POLYGON,
            properties
        });
        this._metadata.setCodecs();
        let serverUrls = Array.isArray(options.serverURL) ? options.serverURL : [options.serverURL];
        serverUrls = serverUrls.map(serverUrl => {
            return `${serverUrl}&${measurements.map(m => `measurement=${m}`).join('&')}`;
        });
        this._tileClient = new TileClient(serverUrls);
    }

    _clone () {
        return new CommonGrid(this._measurements, JSON.parse(JSON.stringify(this._options)));
    }

    bindLayer (addDataframe) {
        this._tileClient.bindLayer(addDataframe);
    }

    async requestMetadata () {
        return this._metadata;
    }

    requestData (zoom, viewport) {
        const viewportZoomToSourceZoom = zoom => {
            if (zoom > 15) {
                return 15;
            }
            if (zoom < 12) {
                return 12;
            }
            return Math.floor(zoom);
        };
        return this._tileClient.requestData(zoom, viewport, (x, y, z, url) => {
            return this._requestDataframe(x, y, z, url);
        }, viewportZoomToSourceZoom);
    }

    free () {
        this._tileClient.free();
    }

    async _requestDataframe (x, y, z, url) {
        const response = await fetch(url);
        const cells = await response.json();
        if (cells.length === 0 || response === 'null') {
            return { empty: true };
        }

        const { geometries, properties, numFeatures } = this._decodeCells(cells, z);
        const rs = rsys.getRsysFromTile(x, y, z);
        return this._generateDataFrame(rs, geometries, properties, numFeatures);
    }

    _decodeCells (cells, zoom) {
        const extent = Math.pow(2, MAX_ZOOM - zoom);
        const geometries = [];
        const { properties } = this._initializePropertyArrays(this._metadata, cells.length);
        const scalarPropertyCodecs = this._scalarPropertyCodecs(this._metadata);

        cells.forEach((cell, i) => {
            const k = cell[0];
            const subQk = k.substring(zoom);
            const { x, y } = toXYZ(subQk);
            const geom = [
                [
                    { x, y: y + 1 },
                    { x, y },
                    { x: x + 1, y },
                    { x: x + 1, y: y + 1 },
                    { x, y: y + 1 }
                ]
            ];
            geometries.push(decodePolygons(geom, extent));
            this._decodeProperties(scalarPropertyCodecs, properties, cell, k, i);
        });

        const numFeatures = cells.length;
        return { properties, geometries, numFeatures };
    }

    _initializePropertyArrays (metadata, length) {
        const propertyNames = this._getPropertyNamesFrom(metadata);
        const properties = this._getPropertiesFor(propertyNames, length);
        return { propertyNames, properties };
    }

    _getSourcePropertyNamesFrom (metadata) {
        return metadata.propertyKeys.filter(name => metadata.properties[metadata.baseName(name)].type !== 'geometry');
    }

    _getPropertyNamesFrom (metadata) {
        const propertyNames = [];
        this._getSourcePropertyNamesFrom(metadata).forEach(sourceName => {
            metadata.decodedProperties(sourceName).forEach(propertyName => {
                propertyNames.push(propertyName);
            });
        });
        return propertyNames;
    }

    _getPropertiesFor (propertyNames, length) {
        const properties = {};
        const size = Math.ceil(length / RTT_WIDTH) * RTT_WIDTH;

        const arrayBuffer = new ArrayBuffer(4 * size * propertyNames.length);
        for (let i = 0; i < propertyNames.length; i++) {
            const propertyName = propertyNames[i];
            properties[propertyName] = new Float32Array(arrayBuffer, i * 4 * size, size);
        }

        return properties;
    }

    _scalarPropertyCodecs (metadata) {
        return this._getSourcePropertyNamesFrom(metadata)
            .map(prop => [prop, metadata.codec(prop)])
            .filter(([_, codec]) => !codec.isRange());
    }

    _decodeProperties (scalarPropertyCodecs, properties, cell, k, i) {
        let length = scalarPropertyCodecs.length;
        for (let j = 0; j < length; j++) {
            const [propertyName, codec] = scalarPropertyCodecs[j];
            if (propertyName === 'id') {
                properties[propertyName][i] = codec.sourceToInternal(k);
            } else {
                const idx = this._measurementsIndex[propertyName];
                const propertyValue = cell[idx + 1];
                properties[propertyName][i] = codec.sourceToInternal(propertyValue);
            }
        }
    }

    _generateDataFrame (rs, geometry, properties, size) {
        return new Dataframe({
            active: false,
            center: rs.center,
            geom: geometry,
            properties: properties,
            scale: rs.scale,
            size: size,
            type: this._metadata.geomType,
            metadata: this._metadata
        });
    }
}
