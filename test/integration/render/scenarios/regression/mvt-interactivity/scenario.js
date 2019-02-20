const map = new mapboxgl.Map({
    container: 'map',
    style: { version: 8, sources: {}, layers: [] },
    center: [0, 0],
    zoom: 0
});

const METADATA = {
    properties: {
        cartodb_id: { type: 'number' },
        winner: { type: 'category' }
    },
    idProperty: 'winner' // 'cartodb_id'
};

const MVT_FILE = '/test/integration/user/test/data/5_15_10.mvt';
const source = new carto.source.MVT(MVT_FILE, METADATA);
const viz = new carto.Viz(`
    @f_cartodb_id: $cartodb_id
    @f_winner: $winner

    @v_features: viewportFeatures($winner)
    strokeWidth: 1
`);
const layer = new carto.Layer('my_mvt_layer', source, viz);

const interactivity = new carto.Interactivity(layer);

interactivity.on('featureClick', async (event) => {
    const aFeature = event.features[0];

    /*
        Highlight clicked feature on snapshot.

        Using 'cartodb_id' as idProperty allows to better identify the real clicked 'polygon',
        but it doesn't reproduce the regression.
        To force the regression, 'winner' category is considered here "the id",
        so that renders all the polygons with the same winner, as 'clicked' (imagine 'kind of a multi-polygon')
    */

    await aFeature.color.blendTo('DeepPink', 0);
    layer.on('updated', debounceSetLoaded());
});

layer.addTo(map);

layer.on('loaded', () => {
    simulateClickAtClientXY({ x: 300, y: 150 });
});

function simulateClickAtClientXY (position) {
    const el = document.querySelector('.mapboxgl-canvas-container');

    const params = { clientX: position.x, clientY: position.y, bubbles: true };
    const mousedown = new MouseEvent('mousedown', params);
    const click = new MouseEvent('click', params);
    const mouseup = new MouseEvent('mouseup', params);

    el.dispatchEvent(mousedown);
    el.dispatchEvent(click);
    el.dispatchEvent(mouseup);
}

function debounceSetLoaded (delay = 250) {
    let timeoutId;
    return function () {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            window.loaded = true;
        }, delay);
    };
}
