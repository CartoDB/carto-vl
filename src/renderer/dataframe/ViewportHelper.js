import { triangleCollides } from '../../utils/collision';
import { pointInTriangle, pointInCircle, GEOMETRY_TYPE } from '../../utils/geometry';
import { FILTERING_THRESHOLD } from '../Renderer';
import { RESOLUTION_ZOOMLEVEL_ZERO } from '../../constants/layer';
import ProjectionHelper from './ProjectionHelper';

const AABBTestResults = {
    INSIDE: 1,
    OUTSIDE: -1,
    INTERSECTS: 0
};

const SIZE_SATURATION_PX = 1024;

export default class ViewportHelper {
    constructor (dataframe) {
        this.dataframe = dataframe;

        this.getFeature = dataframe.getFeature.bind(dataframe);
        this._getGL = dataframe._getGL.bind(dataframe);
        this._projection = new ProjectionHelper(dataframe);
    }

    // References pointing to dataframe, to be in sync with its updates
    get decodedGeom () { return this.dataframe.decodedGeom; }
    get _aabb () { return this.dataframe._aabb; }
    get numFeatures () { return this.dataframe.numFeatures; }
    get renderer () { return this.dataframe.renderer; }
    get matrix () { return this.dataframe.matrix; }
    get scale () { return this.dataframe.scale; }

    /**
     * Checks if the point is inside the viewport.
     */
    isPointInViewport (featureIndex) {
        const vertices = this.decodedGeom.vertices;
        const x = vertices[6 * featureIndex + 0];
        const y = vertices[6 * featureIndex + 1];

        const { ox, oy, ow } = this._projection.toClipSpace(x, y);

        // Checks in Clip Space if the point is inside the viewport
        // See https://www.khronos.org/opengl/wiki/Vertex_Post-Processing#Clipping
        const inside = ox > -ow && ox < ow && oy > -ow && oy < ow;
        return inside;
    }

    /**
     * Checks if the polygon is inside the viewport.
     */
    isPolygonInViewport (featureIndex) {
        const featureAABB = this._aabb[featureIndex];
        const aabbResult = this._compareAABBs(featureAABB);

        if (aabbResult === AABBTestResults.INTERSECTS) {
            const vertices = this.decodedGeom.vertices;
            const normals = this.decodedGeom.normals;
            const range = this.decodedGeom.featureIDToVertexIndex.get(featureIndex);
            return this._isPolygonCollidingViewport(vertices, normals, range.start, range.end);
        }

        return aabbResult === AABBTestResults.INSIDE;
    }

    /**
     * Get canvas size in pixels, in a {WIDTH, HEIGHT} object, using the devicePixelRatio
     */
    _getCanvasSizeInPixels () {
        const canvas = this._getGL().canvas;
        const WIDTH = canvas.width / window.devicePixelRatio;
        const HEIGHT = canvas.height / window.devicePixelRatio;

        return { WIDTH, HEIGHT };
    }

    _compareAABBs (featureAABB) {
        if (featureAABB === null) {
            return AABBTestResults.OUTSIDE;
        }

        const corners1 = this._projection.toNDC(featureAABB.minx, featureAABB.miny);
        const corners2 = this._projection.toNDC(featureAABB.minx, featureAABB.maxy);
        const corners3 = this._projection.toNDC(featureAABB.maxx, featureAABB.miny);
        const corners4 = this._projection.toNDC(featureAABB.maxx, featureAABB.maxy);

        const featureStrokeAABB = {
            minx: Math.min(corners1.x, corners2.x, corners3.x, corners4.x),
            miny: Math.min(corners1.y, corners2.y, corners3.y, corners4.y),
            maxx: Math.max(corners1.x, corners2.x, corners3.x, corners4.x),
            maxy: Math.max(corners1.y, corners2.y, corners3.y, corners4.y)
        };

        const viewportAABB = {
            minx: -1,
            miny: -1,
            maxx: 1,
            maxy: 1
        };

        switch (true) {
            case this._isFeatureAABBInsideViewport(featureStrokeAABB, viewportAABB):
                return AABBTestResults.INSIDE;
            case this._isFeatureAABBOutsideViewport(featureStrokeAABB, viewportAABB):
                return AABBTestResults.OUTSIDE;
            default:
                return AABBTestResults.INTERSECTS;
        }
    }

    _isPolygonCollidingViewport (vertices, normals, start, end) { // NORMALS??? FIXME TODO
        if (!this.matrix) {
            return false;
        }

        const aabb = { minx: -1, miny: -1, maxx: 1, maxy: 1 };
        for (let i = start; i < end; i += 6) {
            const v1 = this._projection.toNDC(vertices[i + 0], vertices[i + 1]);
            const v2 = this._projection.toNDC(vertices[i + 2], vertices[i + 3]);
            const v3 = this._projection.toNDC(vertices[i + 4], vertices[i + 5]);

            const triangle = [{
                x: v1.x,
                y: v1.y
            }, {
                x: v2.x,
                y: v2.y
            }, {
                x: v3.x,
                y: v3.y
            }];

            if (triangleCollides(triangle, aabb)) {
                return true;
            }
        }

        return false;
    }

    _isFeatureAABBInsideViewport (featureAABB, viewportAABB) {
        return (featureAABB.minx >= viewportAABB.minx && featureAABB.maxx <= viewportAABB.maxx &&
            featureAABB.miny >= viewportAABB.miny && featureAABB.maxy <= viewportAABB.maxy);
    }

    _isFeatureAABBOutsideViewport (featureAABB, viewportAABB) {
        return (featureAABB.minx > viewportAABB.maxx || featureAABB.miny > viewportAABB.maxy ||
            featureAABB.maxx < viewportAABB.minx || featureAABB.maxy < viewportAABB.miny);
    }

    getPointsAtPosition (position, viz) {
        const points = this.decodedGeom.vertices;

        // FIXME: points.length includes rejected points (out of tile)
        // so we use numFeatures here, but should fix the points size
        const features = [];
        for (let i = 0; i < this.numFeatures * 6; i += 6) {
            const featureIndex = i / 6;
            const feature = this.getFeature(featureIndex);

            if (this._isFeatureFiltered(feature, viz.filter)) {
                continue;
            }

            const point = { x: points[i], y: points[i + 1] };
            const { center, radius } = this._getCircleFor(point, feature, viz);

            const inside = pointInCircle(position, center, radius);
            if (inside) {
                features.push(feature);
            }
        }

        return features;
    }

    _isFeatureFiltered (feature, filterExpression) {
        return filterExpression.eval(feature) < FILTERING_THRESHOLD;
    }

    /**
     * Gets a circle for that point of the feature, considering the viz properties
     * (symbolPlacement, transform, width and strokeWidth).
     *
     * It is expressed as {center, radius}, using pixel coordinates
     */
    _getCircleFor (point, feature, viz) {
        const { WIDTH, HEIGHT } = this._getCanvasSizeInPixels();

        const center = this._projection.toNDC(point.x, point.y);

        // Project to pixel space
        center.x *= 0.5;
        center.y *= -0.5;
        center.x += 0.5;
        center.y += 0.5;
        center.x *= WIDTH;
        center.y *= HEIGHT;

        const radius = this._computePointRadius(feature, viz);

        if (!viz.symbol.default) {
            const symbolOffset = viz.symbolPlacement.eval(feature);
            center.x += symbolOffset[0] * radius;
            center.y -= symbolOffset[1] * radius;
        }

        if (!viz.transform.default) {
            const vizOffset = viz.transform.eval(feature);
            center.x += vizOffset.x;
            center.y -= vizOffset.y;
        }

        return { center, radius };
    }

    getFeaturesAtPositionFromTriangles (geometryType, position, viz) {
        const vertices = this.decodedGeom.vertices;
        const normals = this.decodedGeom.normals;
        const breakpoints = this.decodedGeom.breakpoints;

        const features = [];
        // Linear search for all features
        // Tests triangles since we already have the triangulated form
        // Moreover, with an acceleration structure and triangle testing features could be subdivided easily
        let featureIndex = -1;
        let strokeWidthScale;
        const offset = { x: 0, y: 0 };

        const { WIDTH, HEIGHT } = this._getCanvasSizeInPixels();

        for (let i = 0; i < vertices.length; i += 6) {
            if (i === 0 || i >= breakpoints[featureIndex]) {
                featureIndex++;
                const feature = this.getFeature(featureIndex);

                if (!viz.transform.default) {
                    const vizOffset = viz.transform.eval(feature);
                    offset.x = vizOffset[0];
                    offset.y = vizOffset[1];
                }

                strokeWidthScale = geometryType === GEOMETRY_TYPE.LINE
                    ? this._computeLineWidthScale(feature, viz)
                    : this._computePolygonWidthScale(feature, viz);

                if (this._isFeatureFiltered(feature, viz.filter) ||
                    !this._isPointInAABB(position, offset,
                        geometryType === GEOMETRY_TYPE.LINE
                            ? viz.width.eval(feature)
                            : viz.strokeWidth.eval(feature)
                        ,
                        featureIndex)
                ) {
                    i = breakpoints[featureIndex] - 6;
                    continue;
                }
            }

            const v1 = this._projection.toNDC(
                vertices[i + 0] + normals[i + 0] * strokeWidthScale,
                vertices[i + 1] + normals[i + 1] * strokeWidthScale
            );

            const v2 = this._projection.toNDC(
                vertices[i + 2] + normals[i + 2] * strokeWidthScale,
                vertices[i + 3] + normals[i + 3] * strokeWidthScale
            );

            const v3 = this._projection.toNDC(
                vertices[i + 4] + normals[i + 4] * strokeWidthScale,
                vertices[i + 5] + normals[i + 5] * strokeWidthScale
            );

            v1.x *= 0.5;
            v1.y *= -0.5;
            v1.x += 0.5;
            v1.y += 0.5;

            v2.x *= 0.5;
            v2.y *= -0.5;
            v2.x += 0.5;
            v2.y += 0.5;

            v3.x *= 0.5;
            v3.y *= -0.5;
            v3.x += 0.5;
            v3.y += 0.5;

            const inside = pointInTriangle(position,
                { x: v1.x * WIDTH + offset.x, y: v1.y * HEIGHT - offset.y },
                { x: v2.x * WIDTH + offset.x, y: v2.y * HEIGHT - offset.y },
                { x: v3.x * WIDTH + offset.x, y: v3.y * HEIGHT - offset.y });

            if (inside) {
                features.push(this.getFeature(featureIndex));
                // Don't repeat a feature if the point is on a shared (by two triangles) edge
                // Also, don't waste CPU cycles
                i = breakpoints[featureIndex] - 6;
            }
        }

        return features;
    }

    _isPointInAABB (point, offset, widthScale, featureIndex) {
        // Transform AABB from tile space to NDC space
        const aabb = this._aabb[featureIndex];
        if (aabb === null || !this.matrix) {
            return false;
        }

        const corners1 = this._projection.toNDC(aabb.minx, aabb.miny);
        const corners2 = this._projection.toNDC(aabb.minx, aabb.maxy);
        const corners3 = this._projection.toNDC(aabb.maxx, aabb.miny);
        const corners4 = this._projection.toNDC(aabb.maxx, aabb.maxy);

        const ndcAABB = {
            minx: Math.min(corners1.x, corners2.x, corners3.x, corners4.x),
            miny: Math.min(corners1.y, corners2.y, corners3.y, corners4.y),
            maxx: Math.max(corners1.x, corners2.x, corners3.x, corners4.x),
            maxy: Math.max(corners1.y, corners2.y, corners3.y, corners4.y)
        };

        const { WIDTH, HEIGHT } = this._getCanvasSizeInPixels();

        const ox = 2 * offset.x / WIDTH;
        const oy = 2 * offset.y / HEIGHT;
        const ndcPoint = {
            x: point.x / WIDTH * 2 - 1,
            y: -(point.y / HEIGHT * 2 - 1)
        };

        const pointAABB = {
            minx: ndcPoint.x + ox - widthScale * 2 / WIDTH,
            miny: ndcPoint.y - oy - widthScale * 2 / HEIGHT,
            maxx: ndcPoint.x + ox + widthScale * 2 / WIDTH,
            maxy: ndcPoint.y - oy + widthScale * 2 / HEIGHT
        };

        return !this._isFeatureAABBOutsideViewport(ndcAABB, pointAABB);
    }

    _computePointRadius (feature, viz) {
        const widthPixels = Math.min(viz.width.eval(feature), SIZE_SATURATION_PX);
        const strokeWidthPixels = Math.min(viz.strokeWidth.eval(feature), SIZE_SATURATION_PX);
        const diameter = widthPixels + strokeWidthPixels;
        return diameter / 2;
    }

    _computeLineWidthScale (feature, viz) {
        const diameter = Math.min(viz.width.eval(feature), SIZE_SATURATION_PX);
        return diameter / 2 / this.scale / this._resolutionForZoomLevel();
    }

    _computePolygonWidthScale (feature, viz) {
        const diameter = Math.min(viz.strokeWidth.eval(feature), SIZE_SATURATION_PX);
        return diameter / 2 / this.scale / this._resolutionForZoomLevel();
    }

    _resolutionForZoomLevel () {
        return (Math.pow(2, this.renderer.drawMetadata.zoomLevel) * RESOLUTION_ZOOMLEVEL_ZERO);
    }
}
