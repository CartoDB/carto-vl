import { implicitCast, genBinaryOp, genUnaryOp } from './expressions/utils';
import { palettes } from './expressions/palettes';
import Animate from './expressions/animate';
import Blend from './expressions/blend';
import Buckets from './expressions/buckets';
import CIELab from './expressions/CIELab';
import Expression from './expressions/expression';
import Float from './expressions/float';
import HSV from './expressions/hsv';
import Near from './expressions/near';
import Now from './expressions/now';
import Property from './expressions/property';
import Ramp from './expressions/ramp';
import RGBA from './expressions/rgba';
import SetOpacity from './expressions/setOpacity';
import Top from './expressions/top';
import XYZ from './expressions/xyz';
import Zoom from './expressions/zoom';

const genAggregationOp = (aggName) => class AggregationOperation extends Expression {
    constructor(property) {
        super({ property: property });
    }
    get name() {
        return this.property.name;
    }
    get numCategories() {
        return this.property.numCategories;
    }
    //Override super methods, we don't want to let the property use the raw column, we must use the agg suffixed one
    _compile(metadata) {
        super._compile(metadata);
        this.type = this.property.type;
    }
    _applyToShaderSource(uniformIDMaker, propertyTIDMaker) {
        return {
            preface: '',
            inline: `p${propertyTIDMaker(`_cdb_agg_${aggName}_${this.property.name}`)}`
        };
    }
    _postShaderCompile() { }
    _getMinimumNeededSchema() {
        return {
            columns: [
                `_cdb_agg_${aggName}_${this.property.name}`
            ]
        };
    }
};

// Aggregation ops
const Max = genAggregationOp('max');
const Min = genAggregationOp('min');
const Avg = genAggregationOp('avg');
const Sum = genAggregationOp('sum');
const Mode = genAggregationOp('mode');

// Binary ops
class FloatMul extends genBinaryOp((x, y) => x * y, (x, y) => `(${x} * ${y})`) { }
const FloatDiv = genBinaryOp((x, y) => x / y, (x, y) => `(${x} / ${y})`);
const FloatAdd = genBinaryOp((x, y) => x + y, (x, y) => `(${x} + ${y})`);
const FloatSub = genBinaryOp((x, y) => x - y, (x, y) => `(${x} - ${y})`);
const FloatMod = genBinaryOp((x, y) => x - y, (x, y) => `mod(${x}, ${y})`);
const FloatPow = genBinaryOp((x, y) => Math.pow(x, y), (x, y) => `pow(${x}, ${y})`);

const GreaterThan = genBinaryOp((x, y) => x > y ? 1 : 0, (x, y) => `(${x}>${y}? 1.:0.)`);
const GreaterThanOrEqualTo = genBinaryOp((x, y) => x >= y ? 1 : 0, (x, y) => `(${x}>=${y}? 1.:0.)`);

const LessThan = genBinaryOp((x, y) => x < y ? 1 : 0, (x, y) => `(${x}<${y}? 1.:0.)`);
const LessThanOrEqualTo = genBinaryOp((x, y) => x <= y ? 1 : 0, (x, y) => `(${x}<=${y}? 1.:0.)`);

const Equals = genBinaryOp((x, y) => x == y ? 1 : 0, (x, y) => `(${x}==${y}? 1.:0.)`);
const NotEquals = genBinaryOp((x, y) => x != y ? 1 : 0, (x, y) => `(${x}!=${y}? 1.:0.)`);

// Unary ops
const Log = genUnaryOp(x => Math.log(x), x => `log(${x})`);
const Sqrt = genUnaryOp(x => Math.sqrt(x), x => `sqrt(${x})`);
const Sin = genUnaryOp(x => Math.sin(x), x => `sin(${x})`);
const Cos = genUnaryOp(x => Math.cos(x), x => `cos(${x})`);
const Tan = genUnaryOp(x => Math.tan(x), x => `tan(${x})`);
const Sign = genUnaryOp(x => Math.sign(x), x => `sign(${x})`);
const Abs = genUnaryOp(x => Math.abs(x), x => `abs(${x})`);


// Interpolators
const genInterpolator = (inlineMaker, preface) => class Interpolator extends Expression {
    constructor(m) {
        m = implicitCast(m);
        super({ m: m });
        this.isInterpolator = true; //TODO remove this hack
    }
    _compile(meta) {
        super._compile(meta);
        if (this.m.type != 'float') {
            throw new Error(`Blending cannot be performed by '${this.m.type}'`);
        }
        this.type = 'float';
        this._setGenericGLSL(inline => inlineMaker(inline.m), preface);
    }
};
class Linear extends genInterpolator(inner => inner) { }
class Cubic extends genInterpolator(inner => `cubicEaseInOut(${inner})`,
    `
    #ifndef CUBIC
    #define CUBIC
    float cubicEaseInOut(float p){
        if (p < 0.5) {
            return 4. * p * p * p;
        }else {
            float f = ((2. * p) - 2.);
            return 0.5 * f * f * f + 1.;
        }
    }
    #endif
`) { }



const floatMul = (...args) => new FloatMul(...args);
const floatDiv = (...args) => new FloatDiv(...args);
const floatAdd = (...args) => new FloatAdd(...args);
const floatSub = (...args) => new FloatSub(...args);
const floatPow = (...args) => new FloatPow(...args);
const floatMod = (...args) => new FloatMod(...args);
const log = (...args) => new Log(...args);
const sqrt = (...args) => new Sqrt(...args);
const sin = (...args) => new Sin(...args);
const cos = (...args) => new Cos(...args);
const tan = (...args) => new Tan(...args);
const sign = (...args) => new Sign(...args);
const near = (...args) => new Near(...args);
const blend = (...args) => new Blend(...args);
const rgba = (...args) => new RGBA(...args);
const property = (...args) => new Property(...args);
const animate = (...args) => new Animate(...args);
const hsv = (...args) => new HSV(...args);
const setOpacity = (...args) => new SetOpacity(...args);
const opacity = (...args) => new SetOpacity(...args);
const ramp = (...args) => new Ramp(...args);
const float = (...args) => new Float(...args);
const max = (...args) => new Max(...args);
const min = (...args) => new Min(...args);
const sum = (...args) => new Sum(...args);
const avg = (...args) => new Avg(...args);
const mode = (...args) => new Mode(...args);
const top = (...args) => new Top(...args);
const linear = (...args) => new Linear(...args);
const cubic = (...args) => new Cubic(...args);
const now = (...args) => new Now(...args);
const zoom = (...args) => new Zoom(...args);
const cielab = (...args) => new CIELab(...args);
const xyz = (...args) => new XYZ(...args);
const abs = (...args) => new Abs(...args);
const greaterThan = (...args) => new GreaterThan(...args);
const greaterThanOrEqualTo = (...args) => new GreaterThanOrEqualTo(...args);
const lessThan = (...args) => new LessThan(...args);
const lessThanOrEqualTo = (...args) => new LessThanOrEqualTo(...args);
const equals = (...args) => new Equals(...args);
const notEquals = (...args) => new NotEquals(...args);
const buckets = (...args) => new Buckets(...args);

export {
    palettes, property, blend, now, near, rgba, float, ramp, floatMul, floatDiv, floatAdd, floatSub, floatPow, log, sqrt, sin, cos, tan, sign, setOpacity, opacity, hsv, animate, max, min, top, linear, cubic, zoom, floatMod, cielab, xyz, abs, greaterThan, greaterThanOrEqualTo, lessThan, lessThanOrEqualTo, equals, notEquals, buckets, avg, sum, mode
};