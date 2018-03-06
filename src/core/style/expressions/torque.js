import Expression from './expression';
import { implicitCast, DEFAULT } from './utils';
import { floatDiv, floatMod, now, linear, globalMin, globalMax } from '../functions';
import Property from './property';

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
    constructor(input, duration = 10, fade = new Fade()) {
        if (!Number.isFinite(duration)) {
            throw new Error('Torque duration must be a number');
        }
        if (input instanceof Property) {
            input = linear(input, globalMin(input), globalMax(input));
        }
        const _cycle = floatDiv(floatMod(now(), duration), duration);
        super({ input, _cycle, fade });
        this.duration = duration;
    }
    _compile(meta) {
        super._compile(meta);
        if (this.input.type != 'float') {
            throw new Error('Torque(): invalid first parameter, input.');
        } else if (this.fade.type != 'fade') {
            throw new Error('Torque(): invalid third parameter, fade.');
        }
        this.type = 'float';

        this.inlineMaker = (inline) =>
            `(1.- clamp(abs(${inline.input}-${inline._cycle})*${this.duration.toFixed(20)}/(${inline.input}>${inline._cycle}? ${inline.fade.in}: ${inline.fade.out}), 0.,1.) )`;

    }
    eval(feature) {
        const input = this.input.eval(feature);
        const cycle = this._cycle.eval(feature);
        const duration = this.duration;
        const fadeIn = this.fade.fadeIn.eval(feature);
        const fadeOut = this.fade.fadeOut.eval(feature);
        return 1 - clamp(Math.abs(input - cycle) * duration / (input > cycle ? fadeIn : fadeOut));
    }
}

function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
}
