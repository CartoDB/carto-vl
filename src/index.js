/**
 *  @api
 *  @namespace carto
 *
 *  @description
 *  The CARTO VL functionality is exposed through the **carto** namespace including:
 *
 * - {@link carto.source.Dataset|carto.source.Dataset}
 * - {@link carto.source.SQL|carto.source.SQL}
 * - {@link carto.source.GeoJSON|carto.source.GeoJSON}
 * - {@link carto.expressions|carto.expressions}
 * - {@link carto.Layer|carto.Layer}
 * - {@link carto.Viz|carto.Viz}
 * - {@link carto.Interactivity|carto.Interactivity}
 * - {@link carto.setDefaultAuth|carto.setDefaultAuth}
 * - {@link carto.setDefaultConfig|carto.setDefaultConfig}
 */

import * as expressions from './core/viz/functions';
import GeoJSON from './api/source/geojson';
import Dataset from './api/source/dataset';
import SQL from './api/source/sql';
import Layer from './api/layer';
import Viz from './api/viz';
import { setDefaultAuth } from './api/setup/auth-service';
import { setDefaultConfig } from './api/setup/config-service';
import Map from './api/map';
import Interactivity from './api/interactivity';

// Namespaces

const source = { Dataset, SQL, GeoJSON };

export {
    setDefaultAuth,
    setDefaultConfig,
    source,
    expressions,
    Layer,
    Viz,
    Map,
    Interactivity
};
