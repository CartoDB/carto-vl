import { decodeGeom } from '../../../../src/renderer/decoder';
import GeoJSON from '../../../../src/sources/GeoJSON';
import { GEOMETRY_TYPE } from '../../../../src/utils/geometry';

const geojson = new GeoJSON({
    'type': 'Feature',
    'geometry': {
        'type': 'Point',
        'coordinates': [-64.73, 32.31]
    }
});
const pointGeometry = geojson._decodeGeometry();

falcon.benchmark('decodePoint', () => {
    decodeGeom(GEOMETRY_TYPE.POINT, pointGeometry);
}, { runs: 10000 });
