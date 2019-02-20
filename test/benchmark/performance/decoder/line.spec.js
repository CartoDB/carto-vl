import { decodeGeom } from '../../../../src/renderer/decoder';
import GeoJSON from '../../../../src/sources/GeoJSON';
import { GEOMETRY_TYPE } from '../../../../src/utils/geometry';

const geojson = new GeoJSON({
    'type': 'Feature',
    'geometry': {
        'type': 'LineString',
        'coordinates': [
            [-64.73, 32.31],
            [-80.19, 25.76],
            [-66.09, 18.43],
            [-64.73, 32.31]
        ]
    }
});
const lineGeometry = geojson._decodeGeometry();

falcon.benchmark('decodeLine', () => {
    decodeGeom(GEOMETRY_TYPE.LINE, lineGeometry);
}, { runs: 10000 });
