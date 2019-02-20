import CartoError from './carto-error';

/**
 * Utility to build a cartoError related to Runtime errors.
 *
 * @return {CartoError} A well formed object representing the error.
 */
export default class CartoRuntimeError extends CartoError {
    constructor (message) {
        super({ message: message });
        this.name = 'CartoRuntimeError';
    }
}

export const CartoRuntimeTypes = {
    NOT_SUPPORTED: '[Not supported]:',
    WEB_GL: '[WebGL]:',
    MVT: '[MVT]:'
};
