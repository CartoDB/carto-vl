import { GEOMETRY_TYPE } from '../../utils/geometry';

/**
 * Geometry types available at GeoJSON format
 */
const GeoJSONGeometryType = Object.freeze({
    POINT: 'Point',
    LINE_STRING: 'LineString',
    MULTI_LINE_STRING: 'MultiLineString',
    POLYGON: 'Polygon',
    MULTI_POLYGON: 'MultiPolygon'
});

/**
 * Dataframe geometry type corresponding to every GeoJSON geometry type
 */
function dataframeGeometryType (geojsonGeometryType) {
    switch (geojsonGeometryType) {
        case GeoJSONGeometryType.POINT:
            return GEOMETRY_TYPE.POINT;
        case GeoJSONGeometryType.LINE_STRING:
        case GeoJSONGeometryType.MULTI_LINE_STRING:
            return GEOMETRY_TYPE.LINE;
        case GeoJSONGeometryType.POLYGON:
        case GeoJSONGeometryType.MULTI_POLYGON:
            return GEOMETRY_TYPE.POLYGON;
        default:
            return '';
    }
}

export { GeoJSONGeometryType, dataframeGeometryType };
