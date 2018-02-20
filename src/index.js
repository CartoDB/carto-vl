/**
 *  @api
 *  @namespace carto
 *
 *  @description
 *  # CARTO GL
 *  All the library features are exposed through the `carto` namespace.
 */

import * as expressions from './core/style/functions';
import Dataset from './api/source/dataset';
import Layer from './api/layer';
import SQL from './api/source/sql';
import JSON from './api/source/json';
import Style from './api/style';
import { setDefaultAuth } from './api/setup/auth-service';
import { setDefaultConfig } from './api/setup/config-service';

// Namespaces
const style = { expressions };
const source = { Dataset, SQL, JSON };

export {
    source,
    Layer,
    setDefaultAuth,
    setDefaultConfig,
    style,
    Style
};
