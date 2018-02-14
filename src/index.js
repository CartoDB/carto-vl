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
import Style from './api/style';

// Namespaces
const style = { expressions };
const source = { Dataset, SQL };

export { source, style, Style, Layer };
