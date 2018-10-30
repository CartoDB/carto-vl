/**
 *  Expressions are used to define visualizations, a visualization (viz) is a set named properties and variables and its corresponding values: expressions.
 *  A viz has the following properties:
 *
 *  - **color**: fill color of points and polygons and color of lines
 *  - **strokeColor**: stroke/border color of points and polygons, not applicable to lines
 *  - **width**: fill diameter of points, thickness of lines, not applicable to polygons
 *  - **strokeWidth**: stroke width of points and polygons, not applicable to lines
 *  - **filter**: filter features by removing from rendering and interactivity all the features that don't pass the test.
 *  - **symbol** - show an image instead in the place of points
 *  - **symbolPlacement** - when using `symbol`, offset to apply to the image
 *  - **order**: - rendering order of the features, only applicable to points. See {@link carto.expressions.asc}, {@link carto.expressions.desc} and {@link carto.expressions.noOrder}
 *  - **resolution**: - resolution of the property-aggregation functions, only applicable to points. Default resolution is 1. Custom values must be greater than 0 and lower than 256. A resolution of N means points are aggregated to grid cells NxN pixels. Unlinke {@link https://carto.com/developers/torque-js/guides/how-spatial-aggregation-works/|Torque resolution}, the aggregated points are placed in the centroid of the cluster, not in the center of the grid cell.
 *
 * For example the point diameter could be using the `add` expression:
 *
 * ```javascript
 * const viz = new carto.Viz({
 *   width: carto.expressions.add(5, 5)  // Equivalent to `width: 10`
 * });
 * ```
 *
 * You can use dataset properties inside expressions. Imagine we are representing cities in a map,
 * we can make the point width proportional to the population using the `property`/`prop` expression.
 *
 * ```javascript
 * const viz = new carto.Viz({
 *   width: carto.expressions.prop('population')
 * });
 * ```
 *
 * Multiple expressions can be combined to form more powerful ones,
 * for example lets divide the population between a number using the `div` expression to make points smaller:
 *
 * ```javascript
 * const s = carto.expressions; // We use this alias along documentation.
 * const viz = new carto.Viz({
 *   width: s.div(
 *     s.prop('population'),
 *     10000
 *  )
 * });
 * ```
 *
 * All these expressions can be used also in a String API form. This API is a more compact way to create and use expressions.
 * It has shortcut notation to access your feature properties using the `$` symbol. It also allows inline comments using the JavaScript syntax.
 *
 * ```javascript
 * const viz = new carto.Viz(`
 *   width: $population / 10000  // Size proportional to the population for each feature
 * `);
 * ```
 *
 * Although the combination of expressions is very powerful, you must be aware of the different types to produce valid combinations.
 * For example, the previous example is valid since we assumed that 'population' is a numeric property, it won't be valid if
 * it was a categorical property. Each expression defines some restrictions regarding their parameters, particularly, the
 * type of their parameters.
 *
 * The most important types are:
 *  - **Number** expression. Expressions that contains numbers, both integers and floating point numbers. Boolean types are emulated by this type, being 0 false, and 1 true.
 *  - **Category** expression. Expressions that contains categories. Categories can have a limited set of values, like the country or the region of a feature.
 *  - **Color** expression. Expressions that contains colors. An alpha or transparency channel is included in this type.
 *
 * @namespace carto.expressions
 * @api
 */

/**
 * Depending on the output, each expression has a different type
 *
 * @namespace Types
 * @api
 */

/**
 * Type of Numeric Expressions.
 *
 * Associated to expressions that return is an integer or float. When these expressions are evaluated it should return a JavaScript number.
 *
 * JavaScript numbers are automatically converted to Numeric Expressions.
 *
 * @typedef {} Number
 * @name Number
 * @memberof Types
 * @api
 */

/**
 * Type of Category Expressions.
 *
 * Associated to expressions that return is a category string. When these expressions are evaluated it should return a JavaScript string.
 *
 * JavaScript strings are automatically converted to Category Expressions.
 *
 * @typedef {} Category
 * @name Category
 * @memberof Types
 * @api
 */

/**
 * Type of Color Expressions.
 *
 * Associated to expressions that return a color. When these expressions are evaluated it should return a RGBA object like:
 *
 * ```
 * { r: 255, g: 255, b: 255, a: 1.0 }
 * ```
 *
 * @typedef {} Color
 * @name Color
 * @memberof Types
 * @api
 */

/**
 * Type of Date Expressions.
 *
 * @typedef {} Date
 * @name Date
 * @memberof Types
 * @api
 */

/**
 * Type of Fade Expressions.
 *
 * @typedef {} Fade
 * @name Fade
 * @memberof Types
 * @api
 */

/**
 * Type of Palette Expressions.
 *
 * More information in {@link carto.expressions.palettes|carto.expressions.palettes}.
 *
 * @typedef {} Palette
 * @name Palette
 * @memberof Types
 * @api
 */

/**
 * Type of Image Expressions.
 *
 * More information in {@link carto.expressions.image|carto.expressions.image}.
 *
 * @typedef {} Image
 * @name Image
 * @memberof Types
 * @api
 */

/**
 * Type of Transformation expressions.
 *
 * More information in {@link carto.expressions.rotate|carto.expressions.rotate} and {@link carto.expressions.translate|carto.expressions.translate} expressions.
 *
 * @typedef {} Transformation
 * @name Transformation
 * @memberof Types
 * @api
 */

/**
 * Type of Placement expressions.
 *
 * More information in {@link carto.expressions.placement|carto.expressions.placement} expression.
 *
 * @typedef {} Placement
 * @name Placement
 * @memberof Types
 * @api
 */

/**
 * Type of Ordered Expressions.
 *
 * Order expressions are {@link carto.expressions.asc|carto.expressions.asc}, {@link carto.expressions.desc|carto.expressions.desc} and {@link carto.expressions.noOrder|carto.expressions.noOrder}.
 *
 * @typedef {} Order
 * @name Order
 * @memberof Types
 * @api
 */

/**
 * @namespace Constants
 * @api
 *
*/

/**
 * Constant FALSE value. Equivalent to `carto.expressions.constant(0)`
 *
 * @name expressions.FALSE
 * @memberof Constants
 * @api
*/

/**
 * Constant TRUE value. Equivalent to `carto.expressions.constant(1)`
 *
 * @name expressions.TRUE
 * @memberof Constants
 * @api
*/

/**
 * Constant ALIGN_CENTER translation. Equivalent to `carto.expressions.translate(0, 0)`.
 * Read more about translation in {@link carto.expressions.translate|carto.expressions.translate}
 *
 * @name expressions.ALIGN_CENTER
 * @memberof Constants
 * @api
*/

/**
 * Constant ALIGN_BOTTOM translation. Equivalent to `carto.expressions.translate(0, 1)`.
 * Read more about translation in {@link carto.expressions.translate|carto.expressions.translate}
 *
 * @name expressions.ALIGN_BOTTOM
 * @memberof Constants
 * @api
*/

/**
 * Constant PI number.
 *
 * @name expressions.PI
 * @memberof Constants
 * @api
*/

/**
 * Constant E number.
 *
 * @name expressions.E
 * @memberof Constants
 * @api
*/

/**
 * Constant HOLD number. Max Safe Integer number to be used to "hold" the Fade expression.
 * Read more about fading in {@link carto.expressions.fade|carto.expressions.fade}
 *
 * @name expressions.HOLD
 * @memberof Constants
 * @api
*/

/**
 * @namespace Icons
 * @api
 *
*/

/**
 * Constant BICYCLE icon.
 * Read more about how to use constant icons in {@link carto.expressions.image|carto.expressions.image}.
 * They can also be used in an array, as it is shown in {@link carto.expressions.ramp|carto.expressions.ramp}.
 * There is a list with all the default {@link icons.showcase|icons} available.
 *
 * @name expressions.BICYCLE
 * @memberof Icons
 * @api
*/

/**
 * Constant BUILDING icon.
 * Read more about how to use constant icons in {@link carto.expressions.image|carto.expressions.image}.
 * They can also be used in an array, as it is shown in {@link carto.expressions.ramp|carto.expressions.ramp}.
 * There is a list with all the default {@link icons.showcase|icons} available.
 *
 * @name expressions.BUILDING
 * @memberof Icons
 * @api
*/

/**
 * Constant BUS icon.
 * Read more about how to use constant icons in {@link carto.expressions.image|carto.expressions.image}.
 * They can also be used in an array, as it is shown in {@link carto.expressions.ramp|carto.expressions.ramp}.
 * There is a list with all the default {@link icons.showcase|icons} available.
 *
 * @name expressions.BUS
 * @memberof Icons
 * @api
*/

/**
 * Constant CAR icon.
 * Read more about how to use constant icons in {@link carto.expressions.image|carto.expressions.image}.
 * They can also be used in an array, as it is shown in {@link carto.expressions.ramp|carto.expressions.ramp}.
 * There is a list with all the default {@link icons.showcase|icons} available.
 *
 * @name expressions.CAR
 * @memberof Icons
 * @api
*/

/**
 * Constant CIRCLE icon.
 * Read more about how to use constant icons in {@link carto.expressions.image|carto.expressions.image}.
 * They can also be used in an array, as it is shown in {@link carto.expressions.ramp|carto.expressions.ramp}.
 * There is a list with all the default {@link icons.showcase|icons} available.
 *
 * @name expressions.CIRCLE
 * @memberof Icons
 * @api
*/

/**
 * Constant CIRCLE_OUTLINE icon.
 * Read more about how to use constant icons in {@link carto.expressions.image|carto.expressions.image}.
 * They can also be used in an array, as it is shown in {@link carto.expressions.ramp|carto.expressions.ramp}.
 * There is a list with all the default {@link icons.showcase|icons} available.
 *
 * @name expressions.CIRCLE_OUTLINE
 * @memberof Icons
 * @api
*/

/**
 * Constant CROSS icon.
 * Read more about how to use constant icons in {@link carto.expressions.image|carto.expressions.image}.
 * They can also be used in an array, as it is shown in {@link carto.expressions.ramp|carto.expressions.ramp}.
 * There is a list with all the default {@link icons.showcase|icons} available.
 *
 * @name expressions.CROSS
 * @memberof Icons
 * @api
*/

/**
 * Constant FLAG icon.
 * Read more about how to use constant icons in {@link carto.expressions.image|carto.expressions.image}.
 * They can also be used in an array, as it is shown in {@link carto.expressions.ramp|carto.expressions.ramp}.
 * There is a list with all the default {@link icons.showcase|icons} available.
 *
 * @name expressions.FLAG
 * @memberof Icons
 * @api
*/

/**
 * Constant HOUSE icon.
 * Read more about how to use constant icons in {@link carto.expressions.image|carto.expressions.image}.
 * They can also be used in an array, as it is shown in {@link carto.expressions.ramp|carto.expressions.ramp}.
 * There is a list with all the default {@link icons.showcase|icons} available.
 *
 * @name expressions.HOUSE
 * @memberof Icons
 * @api
*/

/**
 * Constant MARKER icon.
 * Read more about how to use constant icons in {@link carto.expressions.image|carto.expressions.image}.
 * They can also be used in an array, as it is shown in {@link carto.expressions.ramp|carto.expressions.ramp}.
 * There is a list with all the default {@link icons.showcase|icons} available.
 *
 * @name expressions.MARKER
 * @memberof Icons
 * @api
*/

/**
 * Constant MARKER_OUTLINE icon.
 * Read more about how to use constant icons in {@link carto.expressions.image|carto.expressions.image}.
 * They can also be used in an array, as it is shown in {@link carto.expressions.ramp|carto.expressions.ramp}.
 * There is a list with all the default {@link icons.showcase|icons} available.
 *
 * @name expressions.MARKER_OUTLINE
 * @memberof Icons
 * @api
*/

/**
 * Constant SQUARE icon.
 * Read more about how to use constant icons in {@link carto.expressions.image|carto.expressions.image}.
 * They can also be used in an array, as it is shown in {@link carto.expressions.ramp|carto.expressions.ramp}.
 * There is a list with all the default {@link icons.showcase|icons} available.
 *
 * @name expressions.SQUARE
 * @memberof Icons
 * @api
*/

/**
 * Constant SQUARE_OUTLINE icon.
 * Read more about how to use constant icons in {@link carto.expressions.image|carto.expressions.image}.
 * They can also be used in an array, as it is shown in {@link carto.expressions.ramp|carto.expressions.ramp}.
 * There is a list with all the default {@link icons.showcase|icons} available.
 *
 * @name expressions.SQUARE_OUTLINE
 * @memberof Icons
 * @api
*/

/**
 * Constant STAR icon.
 * Read more about how to use constant icons in {@link carto.expressions.image|carto.expressions.image}.
 * They can also be used in an array, as it is shown in {@link carto.expressions.ramp|carto.expressions.ramp}.
 * There is a list with all the default {@link icons.showcase|icons} available.
 *
 * @name expressions.STAR
 * @memberof Icons
 * @api
*/

/**
 * Constant STAR_OUTLINE icon.
 * Read more about how to use constant icons in {@link carto.expressions.image|carto.expressions.image}.
 * They can also be used in an array, as it is shown in {@link carto.expressions.ramp|carto.expressions.ramp}.
 * There is a list with all the default {@link icons.showcase|icons} available.
 *
 * @name expressions.STAR_OUTLINE
 * @memberof Icons
 * @api
*/

/**
 * Constant TRIANGLE icon.
 * Read more about how to use constant icons in {@link carto.expressions.image|carto.expressions.image}.
 * They can also be used in an array, as it is shown in {@link carto.expressions.ramp|carto.expressions.ramp}.
 * There is a list with all the default {@link icons.showcase|icons} available.
 *
 * @name expressions.TRIANGLE
 * @memberof Icons
 * @api
*/

/**
 * Constant TRIANGLE_OUTLINE icon.
 * Read more about how to use constant icons in {@link carto.expressions.image|carto.expressions.image}.
 * They can also be used in an array, as it is shown in {@link carto.expressions.ramp|carto.expressions.ramp}.
 * There is a list with all the default {@link icons.showcase|icons} available.
 *
 * @name expressions.TRIANGLE_OUTLINE
 * @memberof Icons
 * @api
*/

import Transition from './expressions/transition';

import { In } from './expressions/belongs';
import { Nin } from './expressions/belongs';

import Between from './expressions/between';

import { Mul } from './expressions/binary';
import { Div } from './expressions/binary';
import { Add } from './expressions/binary';
import { Sub } from './expressions/binary';
import { Mod } from './expressions/binary';
import { Pow } from './expressions/binary';
import { GreaterThan } from './expressions/binary';
import { GreaterThanOrEqualTo } from './expressions/binary';
import { LessThan } from './expressions/binary';
import { LessThanOrEqualTo } from './expressions/binary';
import { Equals } from './expressions/binary';
import { NotEquals } from './expressions/binary';
import { Or } from './expressions/binary';
import { And } from './expressions/binary';

import Blend from './expressions/blend';

import Buckets from './expressions/buckets';

import BaseCategory from './expressions/basic/category';

import CIELab from './expressions/color/CIELab';

import ClusterAvg from './expressions/aggregation/cluster/ClusterAvg';
import ClusterMax from './expressions/aggregation/cluster/ClusterMax';
import ClusterMin from './expressions/aggregation/cluster/ClusterMin';
import ClusterMode from './expressions/aggregation/cluster/ClusterMode';
import ClusterSum from './expressions/aggregation/cluster/ClusterSum';
import ClusterCount from './expressions/aggregation/cluster/ClusterCount';

import ClusterTime from './expressions/aggregation/cluster/ClusterTime';

import Constant from './expressions/basic/constant';

import Hex from './expressions/color/hex';

import { HSL } from './expressions/color/hsl';
import { HSLA } from './expressions/color/hsl';

import { HSV } from './expressions/color/hsv';
import { HSVA } from './expressions/color/hsv';

import { Cubic } from './expressions/interpolators';
import { ILinear } from './expressions/interpolators';

import Linear from './expressions/linear';

import NamedColor from './expressions/color/NamedColor';

import Now from './expressions/now';

import BaseNumber from './expressions/basic/number';

import Opacity from './expressions/color/Opacity';

import { Asc } from './expressions/ordering';
import { Desc } from './expressions/ordering';
import { NoOrder } from './expressions/ordering';
import { Width } from './expressions/ordering';

import palettes from './expressions/color/palettes';
import Reverse from './expressions/reverse/Reverse';

import Property from './expressions/basic/property';

import GlobalEqIntervals from './expressions/classification/GlobalEqIntervals';
import GlobalQuantiles from './expressions/classification/GlobalQuantiles';
import GlobalStandardDev from './expressions/classification/GlobalStandardDev';

import ViewportEqIntervals from './expressions/classification/ViewportEqIntervals';
import ViewportQuantiles from './expressions/classification/ViewportQuantiles';
import ViewportStandardDev from './expressions/classification/ViewportStandardDev';

import Ramp from './expressions/Ramp';
import List from './expressions/basic/List';

import { RGB } from './expressions/color/rgb';
import { RGBA } from './expressions/color/rgb';

import Time from './expressions/time';
import TimeRangeExpr from './expressions/timeRange';

import Top from './expressions/top';

import { Fade } from './expressions/Fade';
import { Animation } from './expressions/Animation';

import { Log } from './expressions/unary';
import { Sqrt } from './expressions/unary';
import { Sin } from './expressions/unary';
import { Cos } from './expressions/unary';
import { Tan } from './expressions/unary';
import { Sign } from './expressions/unary';
import { Abs, IsNull } from './expressions/unary';
import { Not } from './expressions/unary';
import { Floor } from './expressions/unary';
import { Ceil } from './expressions/unary';

import variableFn from './expressions/basic/variable';

import ViewportAvg from './expressions/aggregation/viewport/ViewportAvg';
import ViewportMax from './expressions/aggregation/viewport/ViewportMax';
import ViewportMin from './expressions/aggregation/viewport/ViewportMin';
import ViewportSum from './expressions/aggregation/viewport/ViewportSum';
import ViewportCount from './expressions/aggregation/viewport/ViewportCount';
import ViewportPercentile from './expressions/aggregation/viewport/ViewportPercentile';
import ViewportHistogram from './expressions/aggregation/viewport/ViewportHistogram';

import GlobalAvg from './expressions/aggregation/global/GlobalAvg';
import GlobalCount from './expressions/aggregation/global/GlobalCount';
import GlobalMax from './expressions/aggregation/global/GlobalMax';
import GlobalMin from './expressions/aggregation/global/GlobalMin';
import GlobalSum from './expressions/aggregation/global/GlobalSum';
import GlobalPercentile from './expressions/aggregation/global/GlobalPercentile';

import ViewportFeatures from './expressions/viewportFeatures';

import Zoom from './expressions/zoom';

import Placement from './expressions/Placement';
import Image from './expressions/Image';
import SVG from './expressions/SVG';
import svgs from './defaultSVGs';
import Zoomrange from './expressions/Zoomrange';
import Scaled from './expressions/Scaled';
import AlphaNormalize from './expressions/AlphaNormalize';
import Translate from './expressions/transformation/Translate';
import Rotate from './expressions/transformation/Rotate';

/* Expose classes as constructor functions */

export const transition = (...args) => new Transition(...args);

const in_ = (...args) => new In(...args);
export const nin = (...args) => new Nin(...args);
export { in_ as in };

export const between = (...args) => new Between(...args);

export const mul = (...args) => new Mul(...args);
export const div = (...args) => new Div(...args);
export const add = (...args) => new Add(...args);
export const sub = (...args) => new Sub(...args);
export const pow = (...args) => new Pow(...args);
export const mod = (...args) => new Mod(...args);
export const greaterThan = (...args) => new GreaterThan(...args);
export const greaterThanOrEqualTo = (...args) => new GreaterThanOrEqualTo(...args);
export const lessThan = (...args) => new LessThan(...args);
export const lessThanOrEqualTo = (...args) => new LessThanOrEqualTo(...args);
export const equals = (...args) => new Equals(...args);
export const notEquals = (...args) => new NotEquals(...args);
export const and = (...args) => new And(...args);
export const or = (...args) => new Or(...args);
export const gt = greaterThan;
export const gte = greaterThanOrEqualTo;
export const lt = lessThan;
export const lte = lessThanOrEqualTo;
export const eq = equals;
export const neq = notEquals;

export const blend = (...args) => new Blend(...args);

export const buckets = (...args) => new Buckets(...args);

export const cielab = (...args) => new CIELab(...args);

export const clusterAvg = (...args) => new ClusterAvg(...args);
export const clusterMax = (...args) => new ClusterMax(...args);
export const clusterMin = (...args) => new ClusterMin(...args);
export const clusterMode = (...args) => new ClusterMode(...args);
export const clusterSum = (...args) => new ClusterSum(...args);
export const clusterCount = (...args) => new ClusterCount(...args);

export const clusterTime = (...args) => new ClusterTime(...args);

export const constant = (...args) => new Constant(...args);

export const image = (...args) => new Image(...args);

export const svg = (...args) => new SVG(...args);

export const hex = (...args) => new Hex(...args);

export const hsl = (...args) => new HSL(...args);
export const hsla = (...args) => new HSLA(...args);

export const hsv = (...args) => new HSV(...args);
export const hsva = (...args) => new HSVA(...args);

export const cubic = (...args) => new Cubic(...args);
export const ilinear = (...args) => new ILinear(...args);

export const linear = (...args) => new Linear(...args);
export const list = (...args) => new List(...args);

export const namedColor = (...args) => new NamedColor(...args);

export const now = (...args) => new Now(...args);

export const number = (...args) => new BaseNumber(...args);

export const opacity = (...args) => new Opacity(...args);

export const asc = (...args) => new Asc(...args);
export const desc = (...args) => new Desc(...args);
export const noOrder = (...args) => new NoOrder(...args);
export const width = (...args) => new Width(...args);

export const reverse = (...args) => new Reverse(...args);

export const property = (...args) => new Property(...args);
export { property as prop };

export const globalQuantiles = (...args) => new GlobalQuantiles(...args);
export const viewportQuantiles = (...args) => new ViewportQuantiles(...args);

export const globalEqIntervals = (...args) => new GlobalEqIntervals(...args);
export const viewportEqIntervals = (...args) => new ViewportEqIntervals(...args);

export const globalStandardDev = (...args) => new GlobalStandardDev(...args);
export const viewportStandardDev = (...args) => new ViewportStandardDev(...args);

export const ramp = (...args) => new Ramp(...args);

export const rgb = (...args) => new RGB(...args);
export const rgba = (...args) => new RGBA(...args);

export const category = (...args) => new BaseCategory(...args);

export const time = (...args) => new Time(...args);
export { time as date };

export const timeRange = (...args) => new TimeRangeExpr(...args);

export const top = (...args) => new Top(...args);

export const fade = (...args) => new Fade(...args);
export const animation = (...args) => new Animation(...args);

export const log = (...args) => new Log(...args);
export const sqrt = (...args) => new Sqrt(...args);
export const sin = (...args) => new Sin(...args);
export const cos = (...args) => new Cos(...args);
export const tan = (...args) => new Tan(...args);
export const sign = (...args) => new Sign(...args);
export const abs = (...args) => new Abs(...args);
export const isNull = (...args) => new IsNull(...args);
export const not = (...args) => new Not(...args);
export const floor = (...args) => new Floor(...args);
export const ceil = (...args) => new Ceil(...args);

export const variable = (...args) => variableFn(...args);
export { variable as var };

export const viewportAvg = (...args) => new ViewportAvg(...args);
export const viewportMax = (...args) => new ViewportMax(...args);
export const viewportMin = (...args) => new ViewportMin(...args);
export const viewportSum = (...args) => new ViewportSum(...args);
export const viewportCount = (...args) => new ViewportCount(...args);
export const viewportPercentile = (...args) => new ViewportPercentile(...args);
export const viewportHistogram = (...args) => new ViewportHistogram(...args);
export const viewportFeatures = (...args) => new ViewportFeatures(...args);
export const globalAvg = (...args) => new GlobalAvg(...args);
export const globalMax = (...args) => new GlobalMax(...args);
export const globalMin = (...args) => new GlobalMin(...args);
export const globalSum = (...args) => new GlobalSum(...args);
export const globalCount = (...args) => new GlobalCount(...args);
export const globalPercentile = (...args) => new GlobalPercentile(...args);

export const zoom = (...args) => new Zoom(...args);
export const scaled = (...args) => new Scaled(...args);
export const zoomrange = (...args) => new Zoomrange(...args);

export const placement = (...args) => new Placement(...args);
export const translate = (...args) => new Translate(...args);
export const rotate = (...args) => new Rotate(...args);
export const alphaNormalize = (...args) => new AlphaNormalize(...args);

export const HOLD = new Constant(Number.MAX_SAFE_INTEGER);
export const TRUE = new Constant(1);
export const FALSE = new Constant(0);
export const PI = new Constant(Math.PI);
export const E = new Constant(Math.E);

export const BICYCLE = new SVG(svgs.bicycle);
export const BUILDING = new SVG(svgs.building);
export const BUS = new SVG(svgs.bus);
export const CAR = new SVG(svgs.car);
export const CIRCLE = new SVG(svgs.circle);
export const CIRCLE_OUTLINE = new SVG(svgs.circleOutline);
export const CROSS = new SVG(svgs.cross);
export const FLAG = new SVG(svgs.flag);
export const HOUSE = new SVG(svgs.house);
export const MARKER = new SVG(svgs.marker);
export const MARKER_OUTLINE = new SVG(svgs.markerOutline);
export const PLUS = new SVG(svgs.plus);
export const SQUARE = new SVG(svgs.square);
export const SQUARE_OUTLINE = new SVG(svgs.squareOutline);
export const STAR = new SVG(svgs.star);
export const STAR_OUTLINE = new SVG(svgs.starOutline);
export const TRIANGLE = new SVG(svgs.triangle);
export const TRIANGLE_OUTLINE = new SVG(svgs.triangleOutline);

export const ALIGN_CENTER = new Placement(constant(0), constant(0));
export const ALIGN_BOTTOM = new Placement(constant(0), constant(1));

export { palettes, Asc, Desc };
