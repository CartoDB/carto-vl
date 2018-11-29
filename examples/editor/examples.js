// 'examples' is used from index.js
// eslint-disable-next-line no-unused-vars
const examples = [
    [
        'WWI ships',
        {
            a: 'wwi',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `width:  zoom() * (animation($day, 140, fade(0.05, 0.2)) + 0.5)
color:  ramp(linear(clusterAvg($temp), 0,30), tealrose)
strokeWidth: 0
filter: animation($day, 140, fade(0.05, 0.2)) + 0.05
`,
            f: {
                lng: 24.73556852040292,
                lat: 19.163470978754944
            },
            g: 0.843866439231284,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'Butterfly migrations',
        {
            a: 'monarch_migration_1',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `width: sqrt(clusterMax($number)/10)
color: opacity(ramp(linear(clusterMax($number)^0.5, 0, 50), Sunset),0.7)
strokeColor: ramp(linear(clusterMax($number)^0.5,0, 50), Sunset)
strokeWidth: 1
`,
            f: {
                lng: -87.70995305070801,
                lat: 37.370049599893434
            },
            g: 2.8377925036325675,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'Non-white',
        {
            a: 'table_5yr_county_acs_copy_1',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `width: sqrt(($asian_pop+$black_pop+$hispanic_o)/$white_pop)*2
color: hsva(0.5, 1, 1, 0.7)
strokeWidth: 0
filter: $white_pop > 1 `,
            f: {
                lng: -89.8202341854498,
                lat: 38.02009109105734
            },
            g: 3.133722433724694,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'Denver accidents',
        {
            a: 'traffic_accidents',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `width:   $count/2
color: opacity( ramp(linear($count, 0,120), RedOr), $count/20)
strokeWidth: 0
`,
            f: {
                lng: -104.96505621566746,
                lat: 39.74961937824622
            },
            g: 11.418718770904494,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'California Wildfires by acreage',
        {
            a: 'fire_perimeter_centroids',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `width:   $gis_acres/10000
color: rgba(0,0,0,0)
strokeColor:  hsv(0.1, $gis_acres/200000, $gis_acres/400000)
strokeWidth: $gis_acres/50000`,
            f: {
                lng: -116.21387836632636,
                lat: 38.07278318836194
            },
            g: 5.181189861652186,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'California Wildfires size/opacity by acres burned colored by cause ',
        {
            a: 'fire_perimeter_centroids',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `width: $gis_acres/10000
color: opacity(ramp(linear($cause, 1,14), Prism),$gis_acres/100000)
strokeWidth: 0
`,
            f: {
                lng: -119.67307633790483,
                lat: 37.47815286806755
            },
            g: 4.946911442559713,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'Population Density - Filtering & Buckets',
        {
            a: 'pop_density_points',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `width: zoom()
color: ramp(buckets($dn, [80, 100, 140]), prism)
strokeWidth: 0
filter: $dn > 60
`,
            f: {
                lng: 23.45301819237261,
                lat: 11.239956068640154
            },
            g: 1.3559605306411373,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'Commuters who travel outside home county for work',
        {
            a: 'commuter_flow_by_county_5',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `width: $workers_in_flow/2903461*100*4
color: opacity(ramp(linear($workers_in_flow,0,100000) ,ag_GrnYl), $residence_fips_concat-$work_fips_concat)
strokeWidth: 0
`,
            f: {
                lng: -101.07701446794584,
                lat: 40.91361168096236
            },
            g: 3.3483738193018637,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'Ethnic',
        {
            a: 'table_5yr_county_acs_copy_1',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `@sum_asian: clusterSum($asian_pop)
@sum_black: clusterSum($black_pop)
@sum_white: clusterSum($white_pop)
@sum_hispanic: clusterSum($hispanic_o)
@sum_all: @sum_asian + @sum_black + @sum_hispanic + @sum_white

width: sqrt(@sum_all) / 400 * zoom()
color: opacity(hsv(0.00,1,1) * @sum_black / @sum_all * 1 +
             hsv(0.66,1,1) * @sum_asian / @sum_all * 3 +
             hsv(0.15,0,1) * @sum_white / @sum_all * 0.8 +
             hsv(0.33,1,1) * @sum_hispanic / @sum_all * 1, 0.8)
strokeWidth: 1
strokeColor: #000
order: desc(width())
resolution: 4
`,
            f: {
                lng: -93.89724214905107,
                lat: 35.8750501729363
            },
            g: 3.1080824792155908,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'Pluto',
        {
            a: 'mnmappluto',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `color: ramp(linear(log($numfloors), 1, 4), Earth)
strokeColor: opacity(white, 0.2)
`,
            f: {
                lng: -73.99027791402472,
                lat: 40.73561210607173
            },
            g: 11.883377716137133,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'Pluto - filtered',
        {
            a: 'mnmappluto',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `color: ramp(linear(log($numfloors), 2, 4), temps)
strokeColor: opacity(white, 0.5)
filter: between($numfloors, 10, 120)
`,
            f: {
                lng: -73.98353344380632,
                lat: 40.747976751327
            },
            g: 12.562936305448682,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'SF Lines',
        {
            a: 'sf_stclines',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `color: ramp($st_type, prism)
width: 1.5
`,
            f: {
                lng: -122.44408486861192,
                lat: 37.773706736149705
            },
            g: 11.664310802866805,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'Gecat',
        {
            a: 'select *, 1 as co from gecat_geodata_copy',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `color: opacity(ramp(linear(log(clusterAvg($speed)), 0, 4), Geyser), clusterCount()*zoom()/1000*1.8*4)
width: 2
strokeWidth: 0
resolution: 0.25`,
            f: {
                lng: 2.17,
                lat: 41.38
            },
            g: 13,
            h: 'DarkMatter',
            i: 'query'
        }
    ],
    [
        'BC Category filtering',
        {
            a: 'tx_0125_copy_copy',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `width: sqrt(clusterSum($amount)/50000)*20*(zoom()/4000+0.01)*1.5
color: ramp(clusterMode($category), Prism)
strokeColor: opacity(white, 0.5)
filter: in(clusterMode($category), [\'Transportes\', \'Salud\'])`,
            f: {
                lng: 2.178173022889041,
                lat: 41.39930591407904
            },
            g: 11.882919042717432,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'Crazy images',
        {
            a: 'traffic_accidents',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `width: $count/2 +8
color: opacity( ramp(linear($count, 0,120), RedOr), $count/20+0.4)
symbolPlacement: placement(sin(0.1*$count*now()) , cos(0.1*$count*now()))
symbol: ramp(buckets(100*(0.1*now()%1 >0.5),  [50]), [
  image('../styling/marker.svg'),
  image('../styling/star.svg')
])
`,
            f: {
                lng: -104.96260543125828,
                lat: 39.729360220153495
            },
            g: 12.489655489898993,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ],
    [
        'Flower image',
        {
            a: 'fire_perimeter_centroids',
            b: '',
            c: 'cartovl',
            d: 'https://{user}.carto.com',
            e: `width: $gis_acres/3000
symbol: ramp(linear($cause, 1,14), Prism) * image('../styling/flower.svg')`,
            f: {
                lng: -119.45492286062716,
                lat: 38.04448855312296
            },
            g: 5.4504873403225105,
            h: 'DarkMatter',
            i: 'dataset'
        }
    ]
];
