/**
 *  @namespace carto
 *  @api
 *
 *  @description
 *  The CARTO VL functionality is exposed through the **carto** namespace including:
 *
 * Current version:
 * - {@link carto.version|carto.version}
 *
 * Setup:
 * - {@link carto.setDefaultAuth|carto.setDefaultAuth}
 * - {@link carto.setDefaultConfig|carto.setDefaultConfig}
 *
 * CARTO Basemaps:
 * - {@link carto.basemaps.voyager|carto.basemaps.voyager}
 * - {@link carto.basemaps.darkmatter|carto.basemaps.darkmatter}
 * - {@link carto.basemaps.positron|carto.basemaps.positron}
 *
 * Source:
 * - {@link carto.source.Dataset|carto.source.Dataset}
 * - {@link carto.source.GeoJSON|carto.source.GeoJSON}
 * - {@link carto.source.MVT|carto.source.MVT}
 * - {@link carto.source.SQL|carto.source.SQL}
 *
 * Layer:
 * - {@link carto.Layer|carto.Layer}
 *
 * Viz:
 * - {@link carto.Viz|carto.Viz}
 *
 * Expressions:
 * - {@link carto.expressions|carto.expressions}
 *
 * Interactivity:
 * - {@link carto.Interactivity|carto.Interactivity}
 */

import { setDefaultAuth } from './setup/auth-service';
import { setDefaultConfig } from './setup/config-service';
import Viz from './Viz';
import Interactivity from './interactivity/Interactivity';
import Layer from './Layer';
import * as expressions from './renderer/viz/expressions';
import Dataset from './sources/Dataset';
import GeoJSON from './sources/GeoJSON';
import MVT from './sources/MVT';
import SQL from './sources/SQL';
import { on, off } from './utils/events';
import { isBrowserSupported, unsupportedBrowserReasons } from './renderer/Renderer';

/**
 *  @namespace carto.basemaps
 *  @description Use CARTO basemaps for your map visualization. Here you have more information about our {@link https://carto.com/location-data-services/basemaps/|basemaps}.
 *  @api
 */

import * as basemaps from './basemaps';

/**
 * The version of CARTO VL in use as specified in `package.json` and the GitHub release.
 *
 * @var {String} version
 *
 * @memberof carto
 * @api
 */
import { version } from '../package.json';

const source = { Dataset, SQL, GeoJSON, MVT };

export { version, on, off, isBrowserSupported, unsupportedBrowserReasons, setDefaultAuth, setDefaultConfig, source, expressions, Layer, Viz, Interactivity, basemaps };
export default { version, on, off, setDefaultAuth, setDefaultConfig, source, expressions, Layer, Viz, Interactivity, basemaps };
