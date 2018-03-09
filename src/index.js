/**
 *  @api
 *  @namespace carto
 *
 *  @description
 *  # CARTO GL
 *  All the library features are exposed through the `carto` namespace.
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

// Namespaces
const style = { expressions };
const source = { Dataset, SQL, GeoJSON };

export {
    source,
    Layer,
    setDefaultAuth,
    setDefaultConfig,
    style,
    Style,
    Map
};
