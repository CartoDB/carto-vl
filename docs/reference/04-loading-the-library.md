## Loading the Library
CARTO VL is hosted on a CDN for easy loading. You can load the full source "carto-vl.js" file or the minified version "carto-vl.min.js". Once the script is loaded, you will have a global `carto` namespace.
CARTO VL is hosted in NPM as well. You can require it as a dependency in your custom apps.

```html
<!-- CDN: load the latest CARTO VL version -->
<script src="https://libs.cartocdn.com/carto-vl/v0/carto-vl.min.js"></script>

<!-- CDN: load a specific CARTO VL version-->
<script src="https://libs.cartocdn.com/carto-vl/%VERSION%/carto-vl.min.js"></script>
```

```javascript
// NPM: load the latest CARTO VL version
npm install @carto/carto-vl
// or
yarn add @carto/carto-vl

var carto = require('@carto/carto-vl');
// or (ES6)
import carto from '@carto/carto-vl';
```
