import CartoValidationError from '../errors/carto-validation-error';

export function validateServerURL(serverURL) {
    const urlregex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
    if (!serverURL.match(urlregex)) {
        throw new CartoValidationError('source', 'nonValidServerURL');
    }
}

export default {
    validateServerURL,
};
