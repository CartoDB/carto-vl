
const map = new mapboxgl.Map({
    container: 'map',
    style: {
        version: 8,
        sources: {},
        layers: [{
            id: 'background',
            type: 'background',
            paint: { 'background-color': 'black' }
        }]
    },
    center: [0, 0],
    zoom: 0
});

carto.setDefaultAuth({
    apiKey: 'default_public',
    user: 'cartovl'
});

const animStart = '2018-04-11T12:00:00Z';
const animEnd = '2019-12-18T12:00:00Z';

const source = new carto.source.SQL(`
      WITH params AS (
        SELECT
        -- simulation time limits:
        '${animStart}'::timestamp with time zone AS min_st,
        '${animEnd}'::timestamp with time zone AS max_st,
        0.0 AS x0, 0.1 AS y0,
        200 AS length,
        50 AS n
      ),
      positions AS (
        SELECT
          step::float8/n AS s,
          x0 + (step::float8/n - 0.5)*length AS x, y0 AS y
        FROM params, generate_series(1, n) AS step
      )
      SELECT
        row_number() over () AS cartodb_id,
        min_st + (max_st - min_st)*s AS date,
        ST_SetSRID(ST_MakePoint(x, y), 4326) AS the_geom,
        ST_Transform(ST_SetSRID(ST_MakePoint(x, y), 4326), 3857) AS the_geom_webmercator
        FROM params, positions
    `);
const viz = new carto.Viz(`
      @month: clusterTime($date, 'month', 'Europe/Madrid')

      width: linear(@month, '2018-01', '2018-09')*60
      color: ramp(linear(@month), SUNSET)

      filter: animation(@month)

      @list: viewportFeatures(@month)
      @maxMonth: globalMax(@month)
      @minMonth: globalMin(@month)
    `);
const layer = new carto.Layer('layer', source, viz);
layer.addTo(map);
layer.on('loaded', () => {
    viz.filter.pause();
    viz.filter.setProgressPct(0.3);
    layer.on('updated', debounceSetLoaded());
});
