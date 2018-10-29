## Concepts

* Properties:
  + **original** (base) defined by the source origin (SQL query, dataset, file)
    - `date`, `value`
  + **source** included in the source transfer (MVT) (includes aggregated values & dimensions)
    - `_cdb_dim_month_date`, `_cdb_agg_sum_value`, `_cdb_agg_avg_value`
  + **dataframe** encoded in dataframe for GPU consumption (for time ranges: start & end)
    - `_cdb_dim_month_date_start`, `_cdb_dim_month_end`, , `_cdb_agg_sum_value`, `_cdb_agg_avg_value`

* Encodings:
  + **source** (e.g. MVT)
    - For Windshaft dates, source values are UNIX epochs in seconds
    - For Windshaft serial time dimensions, source values are ISO strings
    - For categories source values are strings
  + **internal** (dataframe, GPU)
    - For Windshaft dates, internal values are offsets from the minimum (used to be mapped to 0:1)
    - For Windshaft serial time dimensions, source values are start end date offsets from the start minimum
    - For categories internal values are category ids.
  + **external** (presentation, feature properties, global values)
    - For Windshaft dates, external values are Date objects (could also use epochs in ms)
    - For Windshaft serial time dimensions, external values are TimeRange objects (could also use ISO string)
    - For categories, external values are strings (i.e. source values)

Note that `property.eval(feature)` and `globalMin(property)` are external values; stats kept in the metadata are source values.

There are two kind of source properties: scalar and range;
* **scalar** is encoded into a single dataframe properties and
* **ranges** are encoded into a pair of dataframes properties (lo/hi, start/end).

## Metadata access methods

### `baseName()`: source or dataframe prop to original base property

```javascript
metadata.baseName('cartodb_id') // => 'cartodb_id'
metadata.baseName('_cdb_agg_max_value') // => 'value'
metadata.baseName('_cdb_dim_month_date') // => 'date'
metadata.baseName('_cdb_dim_month_date_end') // => 'date'
// note metadata.baseName('date') // => undefined
```

### `decodedProperties()`: source or dataframe properties => dataframe properties

```javascript
metadata.decodedProperties('cartodb_id') // => ['cartodb_id']
metadata.decodedProperties('_cdb_agg_max_value') // => ['_cdb_agg_max_value']
metadata.decodedProperties('_cdb_dim_month_date') // => ['_cdb_dim_month_date_start', '_cdb_dim_month_end']
metadata.decodedProperties('_cdb_dim_month_date_start') // => ['_cdb_dim_month_date_start', '_cdb_dim_month_end']
// note metadata.decodedProperties('date') // => error
```

### `sourcePropertyName()`: source or dataframe prop to source

```javascript
metadata.sourcePropertyName('cartodb_id') // => 'cartodb_id'
metadata.sourcePropertyName('_cdb_agg_max_value') // => '_cdb_agg_max_value'
metadata.sourcePropertyName('_cdb_dim_month_date_end') // => '_cdb_dim_month_date'
metadata.sourcePropertyName('_cdb_dim_month_date') // => '_cdb_dim_month_date'
// note metadata.sourcePropertyName('date') // => error
```

## Metadata structure

### `propertyKeys`: source property names

```javascript
metadata.propertyKeys : [
  "_cdb_dim_month_date"
  "_cdb_agg_max_value"
  "_cdb_agg_avg_value"
  "cartodb_id"
  "the_geom_webmercator"
  "_cdb_feature_count"
]
```

### `properties`

`metadata.properties`: One entry for each base (original) property.

Simple cases:

```
basecol:
  type: 'number'
  min, max, ...: Number
  codec: Codec // numeric codec used for the property
```

```
basecol:
  type: 'category'
  categories: { top categories as strings with count },
  codec: Codec // category codec used for the property
```

```
basecol:
  type: 'date'
  min, max: Number // source encoding is epoch number
  codec: Codec // date codec used for the property
```

Aggregations (only Windshaft)

```
basecol:
  type: 'number'
  min, max, ...: Number
  aggregations:
    fn: _cdb_agg_<fn>_<basecol>
  codec: Codec // codec used for all the aggregations
```

Dimensions  (only Windshaft)

Scalar dimension (cyclic periods)

```
basecol:
  type: 'date'
  min, max: epoch seconds number (source encoding)
  dimension:
    name: _cdb_dim_<U>_<basecol>
    type: 'number'
  codec: Codec // numeric codec used for the numeric dimension
```

Range dimension (serial time periods)

```
basecol:
  type: 'date'
  min, max: epoch seconds number (source encoding)
  dimension:
    name: _cdb_dim_<U>_<basecol>
    type: 'category'
    min, max: string // (source encoding is ISO formatted string)
    range: [ _cdb_dim_<U>_<basecol>_start, _cdb_dim_<U>_<basecol>_end ]
    codec: Codec // range codec used for the dimension
```

The codecs are kept in the metadata per base column. They apply to the source properties derived from the base. For dimensions the kept codec is valid only for the source properties and stats, not for base property and stats.