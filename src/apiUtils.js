
/**
 * Register an event handler for the given event name and for the given list of layers. Valid names are: `loaded`, `updated`.
 *
 * The 'loaded' event will be fired when all the layers are loaded (and their 'loaded' events are fired).
 *
 * The 'updated' event will be fired whenever one of the layers fired an 'updated event',
 * but throttled by requestAnimationFrame to return a maximum of one event per frame.
 *
 * @param {string} eventName - Supported event
 * @param {Layer[]} layerList
 *
 * @memberof carto
 * @api
 */
export function on (eventName, layerList, callback) {
    if (eventName === 'loaded') {
        const waitingGroup = new Set(layerList);
        layerList.forEach(layer => {
            layer.on(eventName, () => {
                waitingGroup.remove(layer);
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
}
