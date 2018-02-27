import { palettes, Inverse } from './expressions/palettes';
import Animate from './expressions/animate';
import Blend from './expressions/blend';
import Buckets from './expressions/buckets';
import CIELab from './expressions/CIELab';
import Float from './expressions/float';
import FloatConstant from './expressions/floatConstant';
import Category from './expressions/category';
import HSV from './expressions/hsv';
import Linear from './expressions/linear';
import Near from './expressions/near';
import Now from './expressions/now';
import Property from './expressions/property';
import Ramp from './expressions/ramp';
import RGBA from './expressions/rgba';
import Opacity from './expressions/opacity';
import Top from './expressions/top';
import XYZ from './expressions/xyz';
import Zoom from './expressions/zoom';

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
import { Or } from './expressions/binary';


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

export { Cubic };


import { ViewportMax, ViewportMin, ViewportAvg, ViewportSum, ViewportCount, ViewportPercentile }
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
export const property = (...args) => new Property(...args);
export const animate = (...args) => new Animate(...args);
export const hsv = (...args) => new HSV(...args);
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
export const inverse = (...args) => new Inverse(...args);

export const TRUE = new FloatConstant(1);
export const FALSE = new FloatConstant(0);
export const and = (...args) => new FloatMul(...args);
export const or = (...args) => new Or(...args);
export const not = (...args) => new Not(...args);

export const gt = greaterThan;
export const gte = greaterThanOrEqualTo;
export const lt = lessThan;
export const lte = lessThanOrEqualTo;

export const eq = equals;
export const neq = notEquals;

export { palettes, Asc, Desc };
