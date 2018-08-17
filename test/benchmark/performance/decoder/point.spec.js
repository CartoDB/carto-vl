import { decodeGeom } from '../../../../src/renderer/decoder';
import GeoJSON from '../../../../src/sources/GeoJSON';

const geojson = new GeoJSON({
    'type': 'Feature',
    'geometry': {
        'type': 'Point',
        'coordinates': [-64.73, 32.31]
    }
});
const pointGeometry = geojson._decodeGeometry();

falcon.benchmark('decodePoint', () => {
    decodeGeom('point', pointGeometry);
}, {runs: 10000});
