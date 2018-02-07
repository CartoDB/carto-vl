/**
 *  @api
 *  @namespace carto
 *
 *  @description
 *  # CARTO GL
 *  All the library features are exposed through the `carto` namespace.
 *
 */

// Temporary for debug

import * as R from './core';
import Dataset from './api/dataset';
import Layer from './api/layer';
import { Style } from './core/style';
import { version } from '../package.json';

const source = {
    Dataset: Dataset
};

export {
    version,
    R,
    source,
    Style,
    Layer
};
