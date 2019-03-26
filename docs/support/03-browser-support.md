## Browser support

CARTO VL requires a browser that supports WebGL, a method of generating dynamic 3D graphics using JavaScript, accelerated through hardware (GPU).

Most modern browsers support CARTO VL, precisely:
 - Chrome latest.
 - Firefox latest.
 - Microsoft Edge latest, with the most recent Windows update.
 - Safari latest.

The library currently requires:
* WebGL 1.
* WebGL 1 `OES_texture_float` extension.
* WebGL parameter `gl.MAX_RENDERBUFFER_SIZE` >= 1024.

Some browsers, specially in old mobile devices, only have experimental or partial WebGL support. We cannot guarantee that CARTO VL will work on those cases.

To easily check if your browser is fully compatible, just open the [browser support example](https://carto.com/developers/carto-vl/examples/#example-check-for-browser-support). It will use two functions from CARTO VL library to check for the requirements: `carto.isBrowserSupported()` and `carto.unsupportedBrowserReasons()`. That page will clearly display in a panel if any issue is found in your browser or everything is fine.

You can grab more information regarding your browser's WebGL support in this link: [WebGL Report](http://webglreport.com/). For more details about WebGL extensions, you can have a look at [Khronos WebGL Extension Registry](https://www.khronos.org/registry/webgl/extensions/). And if you want to check some stats about different WebGL parameters and extensions, you can visit [WebGL Stats](https://webglstats.com/webgl).
