import { version } from '../../package';

export const REQUEST_GET_MAX_URL_LENGTH = 2048;

export function adaptGeometryType (type) {
    switch (type) {
        case 'ST_MultiPolygon':
        case 'ST_Polygon':
            return 'polygon';
        case 'ST_Point':
            return 'point';
        case 'ST_MultiLineString':
        case 'ST_LineString':
            return 'line';
        default:
            throw new Error(`Unimplemented geometry type ''${type}'`);
    }
}

export function adaptColumnType (type) {
    return type === 'string'
        ? 'category'
        : type;
}

// generate a promise under certain assumptions/choices; then if the result changes the assumptions,
// repeat the generation with the new information
export async function repeatablePromise (initialAssumptions, assumptionsFromResult, promiseGenerator) {
    let promise = promiseGenerator(initialAssumptions);
    let result = await promise;
    let finalAssumptions = assumptionsFromResult(result);
    if (JSON.stringify(initialAssumptions) === JSON.stringify(finalAssumptions)) {
        return promise;
    } else {
        return promiseGenerator(finalAssumptions);
    }
}

export function getMapRequest (conf, mapConfig) {
    const mapConfigPayload = JSON.stringify(mapConfig);
    const auth = encodeParameter('api_key', conf.apiKey);
    const client = encodeParameter('client', `vl-${version}`);

    const parameters = [auth, client, encodeParameter('config', mapConfigPayload)];
    const url = generateUrl(generateMapsApiUrl(conf), parameters);

    if (url.length < REQUEST_GET_MAX_URL_LENGTH) {
        return new Request(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    return new Request(generateUrl(generateMapsApiUrl(conf), [auth, client]), {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: mapConfigPayload
    });
}

export function getLayerUrl (layergroup, layerIndex, conf) {
    const params = [encodeParameter('api_key', conf.apiKey)];

    if (layergroup.cdn_url && layergroup.cdn_url.templates) {
        const urlTemplates = layergroup.cdn_url.templates.https;
        return generateUrl(`${urlTemplates.url}/${conf.username}/api/v1/map/${layergroup.layergroupid}/${layerIndex}/{z}/{x}/{y}.mvt`, params);
    }

    return generateUrl(generateMapsApiUrl(conf, `/${layergroup.layergroupid}/${layerIndex}/{z}/{x}/{y}.mvt`), params);
}

export function encodeParameter (name, value) {
    return `${name}=${encodeURIComponent(value)}`;
}

export function generateUrl (url, parameters = []) {
    return `${url}?${parameters.join('&')}`;
}

export function generateMapsApiUrl (conf, path) {
    let url = `${conf.serverURL}/api/v1/map`;
    if (path) {
        url += path;
    }
    return url;
}
