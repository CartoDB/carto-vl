# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).


## [Unreleased]

### Added
- Allow the use of variables for all classifiers: `globalQuantiles`, `globalEqIntervals`, `globalStandardDev`, `viewportQuantiles`, `viewportEqIntervals` and `viewportStandardDev`

### Fixed
- Fix regression in `Interactivity` using MVT and polygons
- Fix getting aggregation expression values passed to `viewportFeatures` expression

## [1.1.1] - 2019-01-16

### Fixed
- Fix performance regression while accessing features' properties from `viewportFeatures`
- Fix regression in `viewportFeatures` including hidden polygons
- Fix Content-Type for files deployed to CDN

## [1.1.0] - 2019-01-15

### Added
- Add `getRenderedCentroid` method to features
- Add `isPlaying` method to animations
- Add `enable`/`disable` methods and `isEnabled` property to `Interactivity`
- Enable user-defined buckets in `viewportHistogram`
- Add and improve examples (legends, widgets, labeling and basemaps)
- Add helpers to validate browser support (`isBrowserSupported` & `unsupportedBrowserReasons`)
- Add tests to check for compatibility with several MGL versions

### Fixed
- Fix `linear` error when evaluating a date property in a feature
- Fix `transparent` color displayed as black
- Fix `symbol` color when setting symbol with blendTo after initializing viz
- Fix `viewportQuantiles` not getting proper buckets
- Fix build to set production babelified library as default `main` in package (used at `import carto from '@carto/carto-vl'`)
- Fix `viewportFeatures` error when line vertices were outside the viewport but there was an intersection
- Fix `layer:updated` event removing unnecessary emissions
- Fix issue sorting null key in `viewportHistogram`
- Fix unwanted `Interactivity` events while using dragPan (and performance improvement)
- Fix `linear` applied to cluster aggregations without explicit limits
- Fix `MVT` category property returning a numeric value
- Fix `Layer.addTo` for MGL v0.52

### Changed
- Change examples to use Mapbox GL version 0.52

## [1.0.0] - 2018-11-08

### Changed
- Change signature in `viewportHistogram` from `(x, weight = 1, size = 1000)` to `(x, size = 20, weight = 1)`.

### Fixed
- Workaround buggy browser implementation of Web Worker transferables objects.

## [0.10.0] - 2018-11-02

### Added
- Official support for unpatched Mapbox GL version 0.50
- Add `isNull` supporting numerical and categorical properties, deprecating `isNaN()`
- Add `filter` and `transform` properties to features returned from `Interactivity` events.
- Change type from `viewportFeatures` expression, adding vizProperties and variables to features as in `Interactivity`
- Add root-level method `blendTo` to features, allowing several viz properties changes with one call.

### Changed
- Eliminate the parameter to specify a property in `globalCount()` and `viewportCount()`
- Move properties in `viewportFeatures` expression to `feature.properties` namespace.

### Removed
- Remove `isNaN()` in favor of `isNull`

### Fixed
- Fix an error when evaluating non-feature-dependent expressions
- Fix `viewportPercentile` (styling by it was broken)
- Fix `viewport*` functions to take clustering into account
- Fix wrong `expressionName` due to mangled `this.constructor.name` in the minified version
- Fix a regression error related to `blendTo` when using feature `reset`.

## [0.9.1] - 2018-10-09
### Fixed
- Fix width and strokeWidth rendering in HighDPI screens

## [0.9.0] - 2018-10-09
### Added
- Add `globalStandardDev` and `viewportStandardDev` classification expressions
- New method `ramp.getLegendData`
- Add expressions `toString()` method
- Add viz `toString()` method
- `ramp` with an image list defaults to `circle` for the `others` bucket
- Add `geometryType` method in Viz
- Add `categoryIndex` expression.
- Add `rotate()`
- Add transformation chaining by using lists
- Add `getJoinedValues` method to `viewportHistogram` expression.
- Add support for `opacity()` with images as first parameter
- Add `carto.basemaps` for easier use of CARTO styles
- Support pitch and bearing (aka rotation/tilt)
- Allow `username` in auth, keeping compatibility with `user`.

### Changed
- Use an optional third parameter in `ramp` expression to override the default value for "others"
- Simplified `CartoError` and new specific error types
- Remove `carto.Map` (used just for tests).
- New build using Babel.

### Fixed
- Fix symbol override
- Fix `blendTo` with `circle` SVG
- Fix small error with color output in `ramp`
- Fix `top()` with non MapsAPI sources
- Fix `isNaN` expression failing in Windows 10

## [0.8.0] - 2018-09-07
### Added
- Add new `clusterCount()` expression
- Support feature-dependant arrays in combination with ramp
- Add support to `.blendTo` with String API expressions
- Support symbol and symbolPlacement in features

### Changed
- zoom() returns the current zoom level in the typical logarithmic form, returning the same value as Mapbox GL Map.getZoom() method
- Unary and Binary operators are case insensitive.

### Fixed
- Add default export to allow `import carto from '@carto/carto-vl';`

## [0.7.0] - 2018-08-24
### Added
- Use the new Custom Layer interface with MGL (v0.48.0-carto1)
- Add `layer.remove()` API function
- Make viz optional in `layer.update(source, viz?)` API function
- Throw error for duplicated properties and variables
- Throw error extra arguments are passed to any expression
- Add reverse expression to arrays, besides palettes

### Changed
- Improve polygon stroke rendering (+ joins)
- Optimize decodeLine and decodePolygon time (2x)
- Use minified bundle for CI testing
- Improve featureIDBuffer generation by 20%
- Trigger feature events (hover, enter, leave) when layers are updated
- Improve error message when creating buckets without an array
- ramp($category, ...) implementation is fixed when using multiple categorical properties
- Use underscore in image constants
- Use local basemaps for testing

### Fixed
- Fix animation example
- Fix interactivity examples

### Removed
- Removed XYZ expression
- Remove imageList expression in favor of simple array []

## [0.6.2] - 2018-08-02
### Added
- Benchmark tests

### Changed
- Render points with triangles. Size up to 1024
- Top refactor: new limit to 16 buckets
- Improve line rendering

### Fixed
- Fix GeoJSON source categories
- Fix spikes in lines triangulation
- Fix GeoJSON precision computing centroid

## [0.6.0] - 2018-07-27
### Added
- Enable E2E on CI with dockerized Windshaft
- Check MVT types
- Editor: select between Dataset / SQL source
- Add "carto.on" and "carto.off" methods
- Add "layer.show" and "layer.hide" methods
- Allow expressions as inputs in viewport classification expressions

### Changed
- Performance optimizations
- Update feature enter example
- Modify image examples
- Improve GeoJSON source
- Improve viewport feature collision

### Removed
- Remove deprecated expressions: torque and sprites

### Fixed
- Fix category filtering interactivity
- Add missing built in images
- Fix viewportHistogram expression
