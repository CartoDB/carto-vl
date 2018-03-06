import Expression from './expression';
import { implicitCast, DEFAULT } from './utils';
import { floatDiv, floatMod, now } from '../functions';


class DateRange extends Expression {
    constructor(from, to) {
        super({});
        this.type = 'dateRange';
        this.inlineMaker = () => undefined;
    }
}
const DEFAULT_FADE = 0.15;


export class Fade extends Expression {
    constructor(param1 = DEFAULT, param2 = DEFAULT) {
        let fadeIn = param1;
        let fadeOut = param2;
        if (param1 == DEFAULT) {
            fadeIn = DEFAULT_FADE;
        }
        if (param2 == DEFAULT) {
            fadeOut = fadeIn;
        }
        console.log(fadeIn, fadeOut);
        fadeIn = implicitCast(fadeIn);
        fadeOut = implicitCast(fadeOut);
        super({ fadeIn, fadeOut });
        this.type = 'fade';
        this.inlineMaker = (inline) => ({
            in: inline.fadeIn,
            out: inline.fadeOut,
        });
    }
}

export class Torque extends Expression {
    constructor(input, duration = 10, fade = new Fade(), dateRange = DEFAULT) {
        if (!Number.isFinite(duration)) {
            throw new Error('Torque duration must be a number');
        }
        dateRange = new DateRange();
        const _cycle = floatDiv(floatMod(now(), duration), duration);
        super({ input, _cycle, fade, dateRange });
        this.duration = duration;
    }
    _compile(meta) {
        super._compile(meta);
        if (this.input.type != 'float') {
            throw new Error('Torque(): invalid first parameter, input.');
        } else if (this.fade.type != 'fade') {
            throw new Error('Torque(): invalid third parameter, fade.');
        } else if (this.dateRange.type != 'dateRange') {
            throw new Error('Torque(): invalid fourth parameter, dateRange.');
        }
        this.type = 'float';

        // FIXME adjust input to dateRange
        this.inlineMaker = (inline) =>
            `(1.- clamp(abs(${inline.input}-${inline._cycle})*${this.duration.toFixed(20)}/(${inline.input}>${inline._cycle}? ${inline.fade.in}: ${inline.fade.out}), 0.,1.) )`;

    }
    // TODO eval
}

function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
}
