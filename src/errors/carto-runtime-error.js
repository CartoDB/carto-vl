import CartoError from './carto-error';

/**
 * Utility to build a cartoError related to Runtime errors.
 *
 * @return {CartoError} A well formed object representing the error.
 */
export default class CartoRuntimeError extends CartoError {
    constructor (types=CartoRuntimeTypes.DEFAULT, message) {
        super({ message });
        this.name = 'CartoRuntimeError';
        this.type = type;
    }
}

export const CartoRuntimeTypes = {
    DEFAULT: '[Error]:',
    NOT_SUPPORTED: '[Not supported]:',
    WEB_GL: '[WebGL]:',
    MVT: '[MVT]:'
};
