/**
 *  @api
 *  @namespace carto.style.expressions
 *  @description
 *  Expressions are used to define styles, a style is composed of an expression for every configurable attribute.
 *  Remember a style has the following attributes:
 *
 *  - **color**: Determine the element fill color.
 *  - **strokeColor**: Determine the element border color.
 *  - **width**: Determine the element width: radius when points, thickness when lines, ignored for polygons.
 *  - **strokeWidth**: Determine the element border size.
 *  - **filter**: This is a special property used to remove elements that do not meet the expression.
 *
 * For example the point radius could be styled using the `number` expression:
 *
 * ```javascript
 * const style = new carto.Style({
 *  width: carto.style.expressions.number(10)
 * });
 * ```
 *
 * You can evaluate dataset properties inside an expression. Imagine we are representing cities in a map,
 * we can set the point width depending on the population using the `property` expression.
 *
 * ```javascript
 * const style = new carto.Style({
 *  width: carto.style.expressions.property('population')
 * });
 * ```
 *
 * Multiple expressions can be combined to form more powerful ones,
 * for example lets divide the population between a number using the `div` expression to make points smaller:
 *
 * ```javascript
 * const s = carto.style.expressions; // We use this alias along documentation.
 * const style = new carto.Style({
 *  width: s.div(
 *      property('population'),
 *      s.number(10000)
 *  ),
 * });
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
 */

import { palettes, Inverse, CustomPalette } from './expressions/palettes';
import Animate from './expressions/animate';
import Blend from './expressions/blend';
import Buckets from './expressions/buckets';
import CIELab from './expressions/CIELab';
import Float from './expressions/float';
import FloatConstant from './expressions/floatConstant';
import Category from './expressions/category';
import Linear from './expressions/linear';
import Near from './expressions/near';
import Now from './expressions/now';
import Property from './expressions/property';
import Ramp from './expressions/ramp';
import Opacity from './expressions/opacity';
import Top from './expressions/top';
import XYZ from './expressions/xyz';
import Zoom from './expressions/zoom';
import { In, Nin } from './expressions/belongs.js';
import Between from './expressions/between';
import Time from './expressions/time';

// Unary ops
import { Log } from './expressions/unary';
import { Sqrt } from './expressions/unary';
import { Sin } from './expressions/unary';
import { Cos } from './expressions/unary';
import { Tan } from './expressions/unary';
import { Sign } from './expressions/unary';
import { Abs } from './expressions/unary';
import { Not } from './expressions/unary';

// Binary ops
import { FloatMul } from './expressions/binary';
import { FloatDiv } from './expressions/binary';
import { FloatAdd } from './expressions/binary';
import { FloatSub } from './expressions/binary';
import { FloatMod } from './expressions/binary';
import { FloatPow } from './expressions/binary';
import { GreaterThan } from './expressions/binary';
import { GreaterThanOrEqualTo } from './expressions/binary';
import { LessThan } from './expressions/binary';
import { LessThanOrEqualTo } from './expressions/binary';
import { Equals } from './expressions/binary';
import { NotEquals } from './expressions/binary';
import { Or, And } from './expressions/binary';


// Aggregation ops
import { Max } from './expressions/aggregation';
import { Min } from './expressions/aggregation';
import { Avg } from './expressions/aggregation';
import { Sum } from './expressions/aggregation';
import { Mode } from './expressions/aggregation';

// Classifiers
import { Quantiles, GlobalQuantiles } from './expressions/quantiles';

// Interpolators
import { ILinear } from './expressions/interpolators';
import { Cubic } from './expressions/interpolators';

import { Torque, Fade } from './expressions/torque';

// Colors
import {RGB, RGBA} from './expressions/rgb';
import {HSV, HSVA} from './expressions/hsv';
import {HSL, HSLA} from './expressions/hsl';
import Hex from './expressions/hex';
import NamedColor from './expressions/named-color';

export { Cubic };


import {
    ViewportMax, ViewportMin, ViewportAvg, ViewportSum, ViewportCount, ViewportPercentile,
    GlobalMax, GlobalMin, GlobalAvg, GlobalSum, GlobalCount, GlobalPercentile
}
    from './expressions/viewportAggregation';

import { Asc, Desc, NoOrder, Width } from './expressions/ordering';

// Expose classes as constructor functions
export const asc = (...args) => new Asc(...args);
export const desc = (...args) => new Desc(...args);
export const noOrder = (...args) => new NoOrder(...args);
export const width = (...args) => new Width(...args);
export const floatMul = (...args) => new FloatMul(...args);
export const floatDiv = (...args) => new FloatDiv(...args);
export const floatAdd = (...args) => new FloatAdd(...args);
export const floatSub = (...args) => new FloatSub(...args);
export const floatPow = (...args) => new FloatPow(...args);
export const floatMod = (...args) => new FloatMod(...args);
export const log = (...args) => new Log(...args);
export const sqrt = (...args) => new Sqrt(...args);
export const sin = (...args) => new Sin(...args);
export const cos = (...args) => new Cos(...args);
export const tan = (...args) => new Tan(...args);
export const sign = (...args) => new Sign(...args);
export const near = (...args) => new Near(...args);
export const blend = (...args) => new Blend(...args);
export const rgba = (...args) => new RGBA(...args);
export const rgb = (...args) => new RGB(...args);
export const hex = (...args) => new Hex(...args);
export const property = (...args) => new Property(...args);
export const animate = (...args) => new Animate(...args);
export const hsv = (...args) => new HSV(...args);
export const hsva = (...args) => new HSVA(...args);
export const hsl = (...args) => new HSL(...args);
export const hsla = (...args) => new HSLA(...args);
export const namedColor = (...args) => new NamedColor(...args);
export const opacity = (...args) => new Opacity(...args);
export const ramp = (...args) => new Ramp(...args);
export const float = (...args) => new Float(...args);
export const category = (...args) => new Category(...args);
export const max = (...args) => new Max(...args);
export const min = (...args) => new Min(...args);
export const sum = (...args) => new Sum(...args);
export const avg = (...args) => new Avg(...args);
export const mode = (...args) => new Mode(...args);
export const top = (...args) => new Top(...args);
export const linear = (...args) => new Linear(...args);
export const cubic = (...args) => new Cubic(...args);
export const ilinear = (...args) => new ILinear(...args);
export const now = (...args) => new Now(...args);
export const zoom = (...args) => new Zoom(...args);
export const cielab = (...args) => new CIELab(...args);
export const xyz = (...args) => new XYZ(...args);
export const abs = (...args) => new Abs(...args);
export const greaterThan = (...args) => new GreaterThan(...args);
export const greaterThanOrEqualTo = (...args) => new GreaterThanOrEqualTo(...args);
export const lessThan = (...args) => new LessThan(...args);
export const lessThanOrEqualTo = (...args) => new LessThanOrEqualTo(...args);
export const equals = (...args) => new Equals(...args);
export const notEquals = (...args) => new NotEquals(...args);
export const buckets = (...args) => new Buckets(...args);
export const quantiles = (...args) => new Quantiles(...args);
export const globalQuantiles = (...args) => new GlobalQuantiles(...args);
export const viewportMax = (...args) => new ViewportMax(...args);
export const viewportMin = (...args) => new ViewportMin(...args);
export const viewportAvg = (...args) => new ViewportAvg(...args);
export const viewportSum = (...args) => new ViewportSum(...args);
export const viewportCount = (...args) => new ViewportCount(...args);
export const viewportPercentile = (...args) => new ViewportPercentile(...args);
export const globalPercentile = (...args) => new GlobalPercentile(...args);
export const globalMax = (...args) => new GlobalMax(...args);
export const globalMin = (...args) => new GlobalMin(...args);
export const globalAvg = (...args) => new GlobalAvg(...args);
export const globalSum = (...args) => new GlobalSum(...args);
export const globalCount = (...args) => new GlobalCount(...args);
export const inverse = (...args) => new Inverse(...args);
export const floatConstant = (...args) => new FloatConstant(...args);
export const torque = (...args) => new Torque(...args);
export const fade = (...args) => new Fade(...args);
export const time = (...args) => new Time(...args);
export const customPalette = (...args) => new CustomPalette(...args);

export const TRUE = new FloatConstant(1);
export const FALSE = new FloatConstant(0);
export const and = (...args) => new And(...args);
export const or = (...args) => new Or(...args);
export const not = (...args) => new Not(...args);

export const gt = greaterThan;
export const gte = greaterThanOrEqualTo;
export const lt = lessThan;
export const lte = lessThanOrEqualTo;
const _in = (...args) => new In(...args);

export const number = float;
export const add = floatAdd;
export const sub = floatSub;
export const mul = floatMul;
export const div = floatDiv;
export const pow = floatPow;
export const mod = floatMod;
export const prop = property;

export const eq = equals;
export const neq = notEquals;
export const nin = (...args) => new Nin(...args);
export const between = (...args) => new Between(...args);


export { _in as in };
export { palettes, Asc, Desc };
