/**
 *  @api
 *  @namespace carto
 *
 *  @description
 *  # CARTO GL
 *  All the library features are exposed through the `carto` namespace.
 *
 */
import Layer from './api/layer';
import Dataset from './api/dataset';
import { Style, parseStyle } from './core/style';

// Source namespace has dataset and SQL
const source = { Dataset };

export { Layer };
export { source };
export { Style };
export { parseStyle }; // TODO(@iago): temporal export, we must find a better place
