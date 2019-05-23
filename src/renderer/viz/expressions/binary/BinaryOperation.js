import BaseExpression from '../base';

import CartoValidationError, { CartoValidationErrorTypes } from '../../../../errors/carto-validation-error';

export const UNSUPPORTED_SIGNATURE = 0;
export const NUMBERS_TO_NUMBER = 1;
export const NUMBER_AND_COLOR_TO_COLOR = 2;
export const COLORS_TO_COLOR = 4;
export const CATEGORIES_TO_NUMBER = 8;
export const IMAGES_TO_IMAGE = 16;

export class BinaryOperation extends BaseExpression {
    constructor (a, b, allowedSignature) {
        super({ a, b });
        this._allowedSignature = allowedSignature;
    }

    _resolveAliases () {
    }

    _getMinimumNeededSchema () {
        return {};
    }

    loadImages () {}

    _getDependencies () {
        return [ this.a, this.b ];
    }

    _bindMetadata (metadata) {
        // super._bindMetadata(metadata);
        const [a, b] = [this.a, this.b];

        const signature = getSignature(a, b);
        if (signature === UNSUPPORTED_SIGNATURE || !(signature && this._allowedSignature)) {
            throw new CartoValidationError(
                `${this.expressionName}(): invalid parameter types\n'a' type was ${a.type}, 'b' type was ${b.type}`,
                CartoValidationErrorTypes.INCORRECT_TYPE
            );
        }

        this.type = getReturnTypeFromSignature(signature);
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
