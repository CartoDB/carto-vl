import { decodeGeom } from '../../../../src/renderer/decoder';
import GeoJSON from '../../../../src/sources/GeoJSON';
import { GEOMETRY_TYPE } from '../../../../src/utils/geometry';

const geojson = new GeoJSON({
    'type': 'Feature',
    'geometry': {
        'type': 'Polygon',
        'coordinates': [
            [
                [-64.73, 32.31],
                [-80.19, 25.76],
                [-66.09, 18.43],
                [-64.73, 32.31]
            ]
        ]
    }
});
const polygonGeometry = geojson._decodeGeometry();

falcon.benchmark('decodePolygon', () => {
    decodeGeom(GEOMETRY_TYPE.POLYGON, polygonGeometry);
}, { runs: 10000 });
