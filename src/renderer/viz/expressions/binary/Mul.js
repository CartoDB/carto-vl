import { number } from '../../expressions';
import {
    BinaryOperation,
    NUMBERS_TO_NUMBER,
    NUMBER_AND_COLOR_TO_COLOR,
    COLORS_TO_COLOR,
    IMAGES_TO_IMAGE
} from './BinaryOperation';

import { implicitCast, checkMaxArguments } from '../utils';

export class Mul extends BinaryOperation {
    constructor (a, b) {
        checkMaxArguments(arguments, 2);

        if (Number.isFinite(a) && Number.isFinite(b)) {
            return number(a * b);
        }

        const allowedSignature = NUMBERS_TO_NUMBER |
                                 NUMBER_AND_COLOR_TO_COLOR |
                                 COLORS_TO_COLOR |
                                 IMAGES_TO_IMAGE;

        a = implicitCast(a);
        b = implicitCast(b);

        super(a, b, allowedSignature);
        this.expressionName = 'mul';
    }

    eval (featureA, featureB) {
        const valueA = this.a.eval(featureA);
        const valueB = this.b.eval(featureB);

        if (this.a.type === 'color' && this.b.type === 'color') {
            return this._evalColors(valueA, valueB);
        }

        return valueA * valueB;
    }

    getLegendData (options) {
        const legendDataA = this.a.getLegendData(options);
        const legendDataB = this.b.getLegendData(options);

        return { a: legendDataA, b: legendDataB };
    }

    _evalColors (colorA, colorB) {
        return {
            r: colorA.r * colorB.r / 255,
            g: colorA.g * colorB.g / 255,
            b: colorA.b * colorB.b / 255,
            a: colorA.a * colorB.a
        };
    }

    _setGenericGLSL (inlineMaker, preface) {
        this.inlineMaker = inlineMaker;
        this.preface = (preface || '');
    }

    _bindMetadata (meta) {
        super._bindMetadata(meta);

        this.inlineMaker = inline => `(${inline.a} * ${inline.b})`;
    }
}
