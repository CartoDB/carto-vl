import BaseExpression from '../base';
import { implicitCast, checkMaxArguments } from '../utils';
import CartoValidationError, { CartoValidationErrorTypes } from '../../../../errors/carto-validation-error';
import { number } from '../../expressions';

export const UNSUPPORTED_SIGNATURE = 0;
export const NUMBERS_TO_NUMBER = 1;
export const NUMBER_AND_COLOR_TO_COLOR = 2;
export const COLORS_TO_COLOR = 4;
export const CATEGORIES_TO_NUMBER = 8;
export const IMAGES_TO_IMAGE = 16;

export class BinaryOperation extends BaseExpression {
    constructor (a, b, signatureMethods, glsl) {
        checkMaxArguments(arguments, 4);

        if (Number.isFinite(a) && Number.isFinite(b)) {
            return number(signatureMethods[NUMBERS_TO_NUMBER](a, b));
        }

        a = implicitCast(a);
        b = implicitCast(b);

        super({ a, b });

        this.signatureMethods = signatureMethods;
        this.glsl = glsl;
        this.allowedSignature = UNSUPPORTED_SIGNATURE;

        this.inlineMaker = inline => glsl(inline.a, inline.b);
    }

    get value () {
        return this.operation(this.a.value, this.b.value);
    }

    get operation () {
        return this.signatureMethods[this._signature] || this.signatureMethods[NUMBERS_TO_NUMBER];
    }

    eval (feature) {
        if (feature) {
            const { featureA, featureB } = this._getDependentFeatures(feature);
            const valueA = this.a.eval(featureA);
            const valueB = this.b.eval(featureB);

            return this.operation(valueA, valueB);
        }

        return this.operation(this.a.value, this.b.value);
    }

    getLegendData (options) {
        const legendDataA = this.a.getLegendData(options);
        const legendDataB = this.b.getLegendData(options);
        const SIZE = legendDataA.data.length;
        const data = [];

        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                const value = this.operation(legendDataA.data[i].value, legendDataB.data[j].value);
                data.push({ value });
            }
        }

        return { data };
    }

    _getDependentFeatures (feature) {
        const { featureA, featureB } = feature.length
            ? { featureA: feature[0], featureB: feature[1] }
            : { featureA: feature, featureB: feature };

        return { featureA, featureB };
    }

    _bindMetadata (meta) {
        super._bindMetadata(meta);
        const [a, b] = [this.a, this.b];

        this._signature = getSignature(a, b);
        if (this._signature === UNSUPPORTED_SIGNATURE || !(this._signature & this.allowedSignature)) {
            throw new CartoValidationError(
                `${this.expressionName}(): invalid parameter types\n'x' type was ${a.type}, 'y' type was ${b.type}`,
                CartoValidationErrorTypes.INCORRECT_TYPE
            );
        }
        this.type = getReturnTypeFromSignature(this._signature);
    }
}

function getSignature (a, b) {
    if (!a.type || !b.type) {
        return undefined;
    } else if (a.type === 'number' && b.type === 'number') {
        return NUMBERS_TO_NUMBER;
    } else if (a.type === 'number' && b.type === 'color') {
        return NUMBER_AND_COLOR_TO_COLOR;
    } else if (a.type === 'color' && b.type === 'number') {
        return NUMBER_AND_COLOR_TO_COLOR;
    } else if (a.type === 'color' && b.type === 'color') {
        return COLORS_TO_COLOR;
    } else if (a.type === 'category' && b.type === 'category') {
        return CATEGORIES_TO_NUMBER;
    } else if ((a.type === 'image' && b.type === 'color') ||
        (a.type === 'image' && b.type === 'color') ||
        (a.type === 'image' && b.type === 'image') ||
        (a.type === 'color' && b.type === 'image')) {
        return IMAGES_TO_IMAGE;
    } else {
        return UNSUPPORTED_SIGNATURE;
    }
}

function getReturnTypeFromSignature (signature) {
    switch (signature) {
        case NUMBERS_TO_NUMBER:
            return 'number';
        case NUMBER_AND_COLOR_TO_COLOR:
            return 'color';
        case COLORS_TO_COLOR:
            return 'color';
        case CATEGORIES_TO_NUMBER:
            return 'number';
        case IMAGES_TO_IMAGE:
            return 'image';
        default:
            return undefined;
    }
}
