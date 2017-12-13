import * as MGL from '../contrib/mapboxgl';


const styles = [
    `width: 3
color: rgba(0.8,0,0,1)`,

    `width: 3
color: rgba(0.8,0,0,0.2)`,

    `width: 3
color: hsv(0, 0, 1)`,

    `width: 3
color: hsv(0, 0.7, 1.)`,

    `width: 3
color: hsv(0.2, 0.7, 1.)`,

    `width: 3
color: hsv(0.7, 0.7, 1.)`,

    `width: 3
color: hsv($category/10, 0.7, 1.)`,

    `width: 3
color: ramp($category, Prism)`,

    `width: 3
color: ramp(top($category, 4), Prism)`,

    `width: 3
color: setOpacity( ramp($category, Prism), $amount/max($amount))`,

    `width: 3
color: ramp($category, Prism)`,

    `width: sqrt($amount/50000)*20
color: ramp($category, Prism)`,

    `width: sqrt($amount/50000)*20*(zoom()/4000+0.01)*1.5
color: ramp($category, Prism)`,

    `width: sqrt($amount/50000)*20*(zoom()/4000+0.01)*1.5
color: ramp($category, Prism)
strokeColor:       rgba(0,0,0,0.7)
strokeWidth:      2*zoom()/50000`
];


const texts = [
    `We can use RGBA colors`,

    `This means that we can change the opacity (alpha) easily`,

    `There is support for other color spaces like HSV (Hue, Saturation, Value)`,

    `Hue, Saturation and Value are defined in the [0,1] range, the hue is wrapped (cylindrical space)`,
    `Hue, Saturation and Value are defined in the [0,1] range, the hue is wrapped (cylindrical space)`,
    `Hue, Saturation and Value are defined in the [0,1] range, the hue is wrapped (cylindrical space)`,

    `You can mix expressions. Here we are setting the hue based on the category of each feature`,

    `We can use turbo-carto inspired ramps too`,

    `We can select the top categories, by grouping the rest into the 'others' buckets`,

    `We can normalize the map based on the amount property by changing the opacity`,

    `But, let's go back a little bit...`,

    `We can create a bubble map easily, and we can use the square root to make the circle's area proportional to the feature's property`,

    `We can make them proportional to the scale too, to avoid not very attractive overlaps`,

    `And, finally, let's put a nice stroke`
];



const shipsStyle = 'width:    blend(1,2,near($day, (25*now()) %1000, 0, 10), cubic) *zoom()\ncolor:    setopacity(ramp($temp, tealrose, 0, 30), blend(0.005,1,near($day, (25*now()) %1000, 0, 10), cubic))';

const barcelonaQueries = [`(SELECT
        the_geom_webmercator,
        amount,
       category
    FROM tx_0125_copy_copy) AS tmp`
    ,
    (x, y, z) => `select st_asmvt(geom, 'lid') FROM
(
    SELECT
        ST_AsMVTGeom(
            ST_SetSRID(ST_MakePoint(avg(ST_X(the_geom_webmercator)), avg(ST_Y(the_geom_webmercator))),3857),
            CDB_XYZ_Extent(${x},${y},${z}), 1024, 0, false
        ),
        SUM(amount) AS amount,
        _cdb_mode(category) AS category
    FROM tx_0125_copy_copy AS cdbq
    WHERE the_geom_webmercator && CDB_XYZ_Extent(${x},${y},${z})
    GROUP BY ST_SnapToGrid(the_geom_webmercator, CDB_XYZ_Resolution(${z})*0.25)
    ORDER BY amount DESC
)AS geom`];

const ships_WWIQueries = [`(SELECT
            the_geom_webmercator,
            temp,
            DATE_PART('day', date::timestamp-'1912-12-31 01:00:00'::timestamp )::numeric AS day
        FROM wwi_ships) AS tmp`
    ,
    (x, y, z) => `select st_asmvt(geom, 'lid') FROM
    (
        SELECT
            ST_AsMVTGeom(
                ST_SetSRID(ST_MakePoint(avg(ST_X(the_geom_webmercator)), avg(ST_Y(the_geom_webmercator))),3857),
                CDB_XYZ_Extent(${x},${y},${z}), 1024, 0, false
            ),
            AVG(temp)::numeric(3,1) AS temp,
            DATE_PART('day', date::timestamp-'1912-12-31 01:00:00'::timestamp )::smallint AS day
        FROM wwi_ships AS cdbq
        WHERE the_geom_webmercator && CDB_XYZ_Extent(${x},${y},${z})
        GROUP BY ST_SnapToGrid(the_geom_webmercator, CDB_XYZ_Resolution(${z})*0.25),
            DATE_PART('day', date::timestamp-'1912-12-31 01:00:00'::timestamp )
    )AS geom
`];

var mapboxgl = window.mapboxgl;
mapboxgl.accessToken = 'pk.eyJ1IjoiZG1hbnphbmFyZXMiLCJhIjoiY2o5cHRhOGg5NWdzbTJxcXltb2g2dmE5NyJ9.RVto4DnlLzQc26j9H0g9_A';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', // stylesheet location
    center: [2.17, 41.38], // starting position [lng, lat]
    zoom: 0, // starting zoom,
});
map.repaint = false;
var mgl = new MGL.MGLIntegrator(map);


map.on('load', _ => {
    $('#barcelona').click(barcelona);
    $('#wwi').click(wwi);

    $('.step').css('display', 'none');
    $('#styleEntry').removeClass('eight columns').addClass('twelve columns');
    $('#styleEntry').on('input', mgl.updateStyle.bind(mgl));

    wwi();

    let index = 0;

    function barcelona() {
        mgl.provider.set(barcelonaQueries, styles[index]);
        $('.step').css('display', 'inline');
        $('#styleEntry').removeClass('twelve columns').addClass('eight columns');
        document.getElementById("styleEntry").value = styles[index];
        $('#tutorial').text(texts[index]);
        mgl.provider.getSchema().then(schema => {
            mgl.setStyle(styles[index]);
            mgl.schema = schema;
            mgl.updateStyle();
        });
    }
    function wwi() {
        mgl.provider.set(ships_WWIQueries, shipsStyle);
        $('.step').css('display', 'none');
        $('#styleEntry').removeClass('eight columns').addClass('twelve columns');
        $('#tutorial').text('');
        document.getElementById("styleEntry").value = 'width:    blend(1,2,near($day, (25*now()) %1000, 0, 10), cubic) *zoom()\ncolor:    setopacity(ramp($temp, tealrose, 0, 30), blend(0.005,1,near($day, (25*now()) %1000, 0, 10), cubic))';
        mgl.provider.getSchema().then(schema => {
            mgl.setStyle(document.getElementById("styleEntry").value);
            mgl.schema = schema;
            mgl.updateStyle();
        });
    }

    $('#prev').click(() => {
        $("#prev").attr("disabled", false);
        $("#next").attr("disabled", false);
        if (index > 0) {
            index--;
            mgl.setStyle(styles[index]);
            $('#tutorial').text(texts[index]);
        }
        if (index == 0) {
            $("#prev").attr("disabled", true);
        }
    });
    $('#next').click(() => {
        $("#prev").attr("disabled", false);
        $("#next").attr("disabled", false);
        if (index < styles.length - 1) {
            index++;
            mgl.setStyle(styles[index]);
            $('#tutorial').text(texts[index]);
        }
        if (index == styles.length - 1) {
            $("#next").prop("disabled", true);
        }
    });

});
