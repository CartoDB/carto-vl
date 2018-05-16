/**
 *  Expressions are used to define vizs, a viz is composed of an expression for every configurable attribute.
 *  Remember a viz has the following attributes:
 *
 *  - **color**: Determine the element fill color.
 *  - **strokeColor**: Determine the element border color.
 *  - **width**: Determine the element width: diameter when points, thickness when lines, not used for polygons.
 *  - **strokeWidth**: Determine the element border size.
 *  - **order**: This is a special property used to order the elements in ascendent/descendent order.
 *  - **filter**: This is a special property used to remove elements that do not meet the expression.
 *  - **resolution**: Determine the resolution of the property-aggregation functions.
 *
 * For example the point diameter could be using the `number` expression:
 *
 * ```javascript
 * const viz = new carto.Viz({
 *   width: carto.expressions.number(10)  // Equivalent to `width: 10`
 * });
 * ```
 *
 * You can evaluate dataset properties inside an expression. Imagine we are representing cities in a map,
 * we can set the point width depending on the population using the `property` expression.
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
 * All these expressions can be used also from a String API. This API is a more compact way to create and use your expressions.
 * It has shortcut notation to access your feature properties using the `$` symbol. It also allows inline comments using the JavaScript style.
 *
 * ```javascript
 * const viz = new carto.Viz(`
 *   width: $population / 10000  // Size proportional to the population for each feature
 * `);
 * ```
 *
 * Although expression combination is very powerful, you must be aware of the different types to produce valid combinations.
 * For example, the previous example is valid since we assumed that 'population' is a numeric property, it won't be valid if
 * it was a categorical property. Each expression defines some restrictions regarding their parameters, particularly, the
 * type of their parameters.
 *
 * The most important types are:
 *  - **Numeric** expression. Expressions that contains numbers, both integers and floating point numbers. Boolean types are emulated by this type, being 0 false, and 1 true.
 *  - **Category** expression. Expressions that contains categories. Categories can have a limited set of values, like the country or the region of a feature.
 *  - **Color** expression. Expressions that contains colors. An alpha or transparency channel is included in this type.
 *
 * @namespace carto.expressions
 * @api
 */

import Animate from './expressions/animate';

import { In } from './expressions/belongs.js';
import { Nin } from './expressions/belongs.js';

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

import Category from './expressions/category';

import CIELab from './expressions/CIELab';

import { ClusterAvg } from './expressions/clusterAggregation';
import { ClusterMax } from './expressions/clusterAggregation';
import { ClusterMin } from './expressions/clusterAggregation';
import { ClusterMode } from './expressions/clusterAggregation';
import { ClusterSum } from './expressions/clusterAggregation';

import Constant from './expressions/constant';

import Hex from './expressions/hex';

import { HSL } from './expressions/hsl';
import { HSLA } from './expressions/hsl';

import { HSV } from './expressions/hsv';
import { HSVA } from './expressions/hsv';

import { Cubic } from './expressions/interpolators';
import { ILinear } from './expressions/interpolators';

import Linear from './expressions/linear';

import { NamedColor } from './expressions/named-color';

import Near from './expressions/near';

import Now from './expressions/now';

import Number from './expressions/number';

import Opacity from './expressions/opacity';

import { Asc } from './expressions/ordering';
import { Desc } from './expressions/ordering';
import { NoOrder } from './expressions/ordering';
import { Width } from './expressions/ordering';

import { palettes } from './expressions/palettes';
import { Inverse } from './expressions/palettes';
import { CustomPalette } from './expressions/palettes';

import Property from './expressions/property';

import { Quantiles, GlobalQuantiles, GlobalEqIntervals, ViewportEqIntervals } from './expressions/classifier';

import Ramp from './expressions/ramp';

import { RGB } from './expressions/rgb';
import { RGBA } from './expressions/rgb';

import String from './expressions/string';

import Time from './expressions/time';

import Top from './expressions/top';

import { Fade } from './expressions/torque';
import { Torque } from './expressions/torque';

import { Log } from './expressions/unary';
import { Sqrt } from './expressions/unary';
import { Sin } from './expressions/unary';
import { Cos } from './expressions/unary';
import { Tan } from './expressions/unary';
import { Sign } from './expressions/unary';
import { Abs } from './expressions/unary';
import { Not } from './expressions/unary';
import { Floor } from './expressions/unary';
import { Ceil } from './expressions/unary';

import Variable from './expressions/variable';

import { ViewportAvg,ViewportMax, ViewportMin, ViewportSum, ViewportCount, ViewportPercentile, ViewportHistogram } from './expressions/viewportAggregation';
import { GlobalAvg, GlobalMax, GlobalMin, GlobalSum, GlobalCount, GlobalPercentile } from './expressions/globalAggregation';

import XYZ from './expressions/xyz';

import Zoom from './expressions/zoom';


/* Expose classes as constructor functions */

export const animate = (...args) => new Animate(...args);

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

export const category = (...args) => new Category(...args);

export const cielab = (...args) => new CIELab(...args);

export const clusterAvg = (...args) => new ClusterAvg(...args);
export const clusterMax = (...args) => new ClusterMax(...args);
export const clusterMin = (...args) => new ClusterMin(...args);
export const clusterMode = (...args) => new ClusterMode(...args);
export const clusterSum = (...args) => new ClusterSum(...args);

export const constant = (...args) => new Constant(...args);

export const hex = (...args) => new Hex(...args);

export const hsl = (...args) => new HSL(...args);
export const hsla = (...args) => new HSLA(...args);

export const hsv = (...args) => new HSV(...args);
export const hsva = (...args) => new HSVA(...args);

export const cubic = (...args) => new Cubic(...args);
export const ilinear = (...args) => new ILinear(...args);

export const linear = (...args) => new Linear(...args);

export const namedColor = (...args) => new NamedColor(...args);

export const near = (...args) => new Near(...args);

export const now = (...args) => new Now(...args);

export const number = (...args) => new Number(...args);

export const opacity = (...args) => new Opacity(...args);

export const asc = (...args) => new Asc(...args);
export const desc = (...args) => new Desc(...args);
export const noOrder = (...args) => new NoOrder(...args);
export const width = (...args) => new Width(...args);

export const inverse = (...args) => new Inverse(...args);

export const customPalette = (...args) => new CustomPalette(...args);

export const property = (...args) => new Property(...args);
export { property as prop };

export const quantiles = (...args) => new Quantiles(...args);
export const globalQuantiles = (...args) => new GlobalQuantiles(...args);
export const globalEqIntervals = (...args) => new GlobalEqIntervals(...args);
export const viewportEqIntervals = (...args) => new ViewportEqIntervals(...args);

export const ramp = (...args) => new Ramp(...args);

export const rgb = (...args) => new RGB(...args);
export const rgba = (...args) => new RGBA(...args);

export const string = (...args) => new String(...args);

export const time = (...args) => new Time(...args);

export const top = (...args) => new Top(...args);

export const fade = (...args) => new Fade(...args);
export const torque = (...args) => new Torque(...args);

export const log = (...args) => new Log(...args);
export const sqrt = (...args) => new Sqrt(...args);
export const sin = (...args) => new Sin(...args);
export const cos = (...args) => new Cos(...args);
export const tan = (...args) => new Tan(...args);
export const sign = (...args) => new Sign(...args);
export const abs = (...args) => new Abs(...args);
export const not = (...args) => new Not(...args);
export const floor = (...args) => new Floor(...args);
export const ceil = (...args) => new Ceil(...args);

export const variable = (...args) => new Variable(...args);
export { variable as var };

export const viewportAvg = (...args) => new ViewportAvg(...args);
export const viewportMax = (...args) => new ViewportMax(...args);
export const viewportMin = (...args) => new ViewportMin(...args);
export const viewportSum = (...args) => new ViewportSum(...args);
export const viewportCount = (...args) => new ViewportCount(...args);
export const viewportPercentile = (...args) => new ViewportPercentile(...args);
export const viewportHistogram = (...args) => new ViewportHistogram(...args);
export const globalAvg = (...args) => new GlobalAvg(...args);
export const globalMax = (...args) => new GlobalMax(...args);
export const globalMin = (...args) => new GlobalMin(...args);
export const globalSum = (...args) => new GlobalSum(...args);
export const globalCount = (...args) => new GlobalCount(...args);
export const globalPercentile = (...args) => new GlobalPercentile(...args);

export const xyz = (...args) => new XYZ(...args);

export const zoom = (...args) => new Zoom(...args);

export const TRUE = new Constant(1);
export const FALSE = new Constant(0);
export const PI = new Constant(Math.PI);

export { palettes, Asc, Desc };
