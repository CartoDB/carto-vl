# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Add new `clusterCount()` expression


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
