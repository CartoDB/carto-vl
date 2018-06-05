import CartoValidationError from './error-handling/carto-validation-error';

export function validateServerURL(serverURL) {
    var urlregex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
    if (!serverURL.match(urlregex)) {
        throw new CartoValidationError('source', 'nonValidServerURL');
    }
}

export function validateTemplateURL(templateURL) {
    var urlregex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=\{\}]*)/;
    if (!templateURL.match(urlregex)) {
        throw new CartoValidationError('source', 'nonValidTemplateURL');
    }
}

export default {
    validateServerURL,
    validateTemplateURL
};
