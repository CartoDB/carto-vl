
let registeredHandlers = [];

/**
 * Register an event handler for the given event name and for the given list of layers. Valid names are: `loaded`, `updated`.
 *
 * The 'loaded' event will be fired when all the layers are loaded (and their 'loaded' events are fired).
 *
 * The 'updated' event will be fired whenever one of the layers fired an 'updated' event,
 * but throttled by requestAnimationFrame to return a maximum of one event per frame.
 *
 * @param {string} eventName - Supported event names are 'loaded' and 'updated'
 * @param {carto.Layer[]} layerList - List of layers
 *
 * @memberof carto
 * @api
 */
export function on (eventName, layerList, callback) {
    if (eventName === 'loaded') {
        const waitingGroup = new Set(layerList);
        layerList.forEach(layer => {
            layer.on('loaded', () => {
                waitingGroup.delete(layer);
                if (waitingGroup.size === 0) {
                    callback();
                }
            });
        });
    } else if (eventName === 'updated') {
        let scheduledRAF = false;
        layerList.forEach(layer => {
            layer.on(eventName, () => {
                if (!scheduledRAF) {
                    window.requestAnimationFrame(() => {
                        scheduledRAF = false;
                        callback();
                    });
                }
            });
        });
    } else {
        throw new Error(`Event name '${eventName}' is not supported by 'carto.on'. Supported event names are: 'loaded', 'updated'.`);
    }
    registeredHandlers.push({
        eventName,
        layerList,
        callback
    });
}

/**
* Remove an event handler for the given event name, layer list and callback.
*
* @param {string} eventName - event
* @param {carto.Layer} layerList - List of layers
* @param {function} callback - Handler function to unregister
*
* @memberof carto
* @api
*/
export function off (eventName, layerList, callback) {
    registeredHandlers.forEach(register => {
        if (register.eventName === eventName &&
            register.layerList.every(registeredLayer => layerList.includes(registeredHandlers)) &&
            register.callback === callback) {
            register.layerList.forEach(layer => {
                layer.off(eventName, callback);
            });
        }
    });
    registeredHandlers = registeredHandlers.filter(register =>
        !(
            register.eventName === eventName &&
            register.layerList.every(registeredLayer => layerList.includes(registeredHandlers)) &&
            register.callback === callback
        )
    );
}
