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

import Layer from './api/layer';
import * as expressions from './core/style/functions';
import { Style, parseStyle } from './core/style';

export { Layer };
export { Style };
export { parseStyle }; // TODO(@iago): temporal export, we must find a better place
export { expressions };



import Dataset from './api/source/dataset';
import SQL from './api/source/sql';

const source = { Dataset, SQL };

export { source };
