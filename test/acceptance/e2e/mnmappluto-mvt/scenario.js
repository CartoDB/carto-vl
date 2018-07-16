const map = new mapboxgl.Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [-74, 40.7],
    zoom: 12
});

async function loadMVT () {
    const mapConfig = {
        buffersize: { mvt: 0 },
        layers: [
            {
                id: 'myCartoLayer',
                type: 'mapnik',
                options: {
                    sql: 'SELECT * FROM mnmappluto'
                }
            }
        ]
    };
    const response = await fetch('https://cartovl.carto.com/api/v1/map', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(mapConfig)
    });
    const layergroup = await response.json();
    const tilejson = layergroup.metadata.tilejson.vector;

    const source = new carto.source.MVT(tilejson.tiles[0], {
        properties: {
            numfloors: {
                type: 'number',
                min: 1,
                max: 130
            }
        }
    },
    {
        viewportZoomToSourceZoom: () => 10,
        maxZoom: 9
    }
    );

    const viz = new carto.Viz(`
        color: ramp(linear($numfloors), prism)
        strokeWidth: 0
    `);
    const layer = new carto.Layer('myCartoLayer', source, viz);

    layer.addTo(map);
    layer.on('loaded', () => window.loaded = true); // Used by screenshot testing utility
}

loadMVT();
