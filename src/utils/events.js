import CartoValidationError, { CartoValidationTypes as cvt } from '../errors/carto-validation-error';

let registeredHandlers = [];

/**
 * Register an event handler for the given event name and for the given list of layers. Valid names are: `loaded`, `updated`.
 *
 * The 'loaded' event will be fired when all the layers are loaded (and their 'loaded' events are fired).
 *
 * The 'updated' event will be fired whenever one of the layers fired an 'updated' event,
 * but throttled by requestAnimationFrame to return a maximum of one event per frame.
 *
 * @param {String} eventName - Supported event names are 'loaded' and 'updated'
 * @param {carto.Layer[]} layerList - List of layers
 *
 * @memberof carto
 * @api
 */
export function on (eventName, layerList, callback) {
    let internalCallbacks = [];
    if (eventName === 'loaded') {
        const waitingGroup = new Set(layerList);
        layerList.forEach(layer => {
            const internalCallback = () => {
                waitingGroup.delete(layer);
                if (waitingGroup.size === 0) {
                    callback();
                }
            };
            layer.on('loaded', internalCallback);
            internalCallbacks.push(internalCallback);
        });
    } else if (eventName === 'updated') {
        let scheduledRAF = false;
        layerList.forEach(layer => {
            const internalCallback = () => {
                if (!scheduledRAF) {
                    window.requestAnimationFrame(() => {
                        scheduledRAF = false;
                        callback();
                    });
                }
            };
            layer.on('updated', internalCallback);
            internalCallbacks.push(internalCallback);
        });
    } else {
        throw new CartoValidationError(`${cvt.INCORRECT_VALUE} Event name '${eventName}' is not supported by "carto.on". Supported event names are: 'loaded' and 'updated'.`);
    }
    registeredHandlers.push({
        eventName,
        layerList,
        callback,
        internalCallbacks
    });
}

/**
* Remove an event handler for the given event name, layer list and callback.
*
* @param {String} eventName - event
* @param {carto.Layer} layerList - List of layers
* @param {function} callback - Handler function to unregister
*
* @memberof carto
* @api
*/
export function off (eventName, layerList, callback) {
    registeredHandlers.forEach(register => {
        if (register.eventName === eventName &&
            register.layerList.every(registeredLayer => layerList.includes(registeredLayer)) &&
            register.callback === callback) {
            register.layerList.forEach(layer => {
                register.internalCallbacks.forEach(internalCallback => {
                    layer.off(eventName, internalCallback);
                });
            });
        }
    });
    registeredHandlers = registeredHandlers.filter(register =>
        !(
            register.eventName === eventName &&
            register.layerList.every(registeredLayer => layerList.includes(registeredLayer)) &&
            register.callback === callback
        )
    );
}
