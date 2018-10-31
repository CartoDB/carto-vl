### Introduction

Welcome to the CARTO VL guides! This documentation is meant to lead you from the basics of creating a map to advanced techniques for developing powerful interactive visualizations. 

If there is any word or term you do not understand while reading the guides, please take a look to our [Glossary](https://carto.com/help/glossary).

### What is CARTO VL?

[CARTO VL](https://github.com/cartodb/carto-vl) is a JavaScript library to create custom location intelligence applications that leverage the power of [CARTO](https://carto.com/). It uses [WebGL](https://www.khronos.org/webgl/) to enable powerful vector maps.

It relies on [Mapbox GL](https://www.mapbox.com/mapbox-gl-js/api) to render the basemaps. Mapbox GL can be used for other functionality too, read [Mapbox GL documentation](https://www.mapbox.com/mapbox-gl-js/api/) for more information. However, keep in mind that CARTO VL layers can only be controlled with the [CARTO VL API]() and that Mapbox GL native layers can **only** be controlled with the Mapbox GL API. Therefore, CARTO VL expressions cannot be used for Mapbox GL layers and vice versa.