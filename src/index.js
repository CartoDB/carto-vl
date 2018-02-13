/**
 *  @api
 *  @namespace carto
 *
 *  @description
 *  # CARTO GL
 *  All the library features are exposed through the `carto` namespace.
 *
 * - **source** : Source description
 */

import * as expressions from './core/style/functions';
import { Style, parseStyle } from './core/style';

export { Style };
export { parseStyle }; // TODO(@iago): temporal export, we must find a better place
export { expressions };



import Dataset from './api/source/dataset';
import SQL from './api/source/sql';
import Layer from './api/layer';

const source = { Dataset, SQL };

export { source, Layer };
