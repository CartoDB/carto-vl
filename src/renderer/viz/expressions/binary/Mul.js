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
        const SIZE = legendDataA.data.length;
        const data = [];

        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                const value = this._evalColors(legendDataA.data[i].value, legendDataB.data[j].value);
                data.push({ value });
            }
        }

        return { data };
    }

    _evalColors (colorA, colorB) {
        return {
            r: Math.round(colorA.r * colorB.r / 255),
            g: Math.round(colorA.g * colorB.g / 255),
            b: Math.round(colorA.b * colorB.b / 255),
            a: colorA.a
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
