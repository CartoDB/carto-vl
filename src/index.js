/**
 *  @api
 *  @namespace carto
 *
 *  @description
 *  The carto-gl functionality is exposed through the **carto** namespace including:
 * 
 * - carto.source
 *  - {@link carto.source.Dataset|carto.source.Dataset} 
 *  - {@link carto.source.SQL|carto.source.SQL}
 *  - {@link carto.source.GeoJSON|carto.source.GeoJSON}
 * - carto.style
 *  -   {@link carto.style.expressions|carto.style.expressions}
 * - {@link carto.Layer|carto.Layer}
 * - {@link carto.Style|carto.Style}
 * - {@link carto.setDefaultAuth|carto.setDefaultAuth}
 * - {@link carto.setDefaultConfig|carto.setDefaultConfig}
 */

import * as expressions from './core/style/functions';
import GeoJSON from './api/source/geojson';
import Dataset from './api/source/dataset';
import SQL from './api/source/sql';
import Layer from './api/layer';
import Style from './api/style';
import { setDefaultAuth } from './api/setup/auth-service';
import { setDefaultConfig } from './api/setup/config-service';
import Map from './api/map';
import JSONArray from './api/source/jsonArray';
import Interactivity from './api/interactivity';

// Namespaces

const style = { expressions };
const source = { Dataset, SQL, GeoJSON, JSONArray };

export {
    source,
    Layer,
    setDefaultAuth,
    setDefaultConfig,
    style,
    Style,
    Map,
    Interactivity
};
