## Versioning

CARTO VL gets regular updates with new features, bug fixes, and performance improvements. We use version numbers to reflect those changes. To assign and increment those version numbers, we follow [Semantic Versioning](https://semver.org/).

This page describes what you should expect in terms of versions availability and updates.

### Version numbers

We distribute the different versions of CARTO VL through different URLs. You can load the latest major, minor, and bug fix versions.

For example, if the `v1.1.0` version is the latest released version, you can load it using any of the following URLs:
 1. https://libs.cartocdn.com/carto-vl/v1/carto-vl.min.js.
 1. https://libs.cartocdn.com/carto-vl/v1.1/carto-vl.min.js.
 1. https://libs.cartocdn.com/carto-vl/v1.1.0/carto-vl.min.js.

If you wanted to load a previous version, `v1.0.0` for instance, you could use the following URLs:
 1. https://libs.cartocdn.com/carto-vl/v1.0/carto-vl.min.js.
 1. https://libs.cartocdn.com/carto-vl/v1.0.0/carto-vl.min.js.

We also distribute CARTO VL through the [npm registry](https://www.npmjs.com/), the CARTO VL npm package is [@carto/carto-vl](https://www.npmjs.com/package/@carto/carto-vl).

#### Choosing a version number

New versions usually bring new features, bug fixes, and performance improvements, so you might be thinking you should always use the latest available major version. It depends. If your application is already performing well and you don't plan to change it, it's OK to use a fixed version, `v1.1.0` for instance. If you want to benefit from latest bug fixes, you could go with the `v1.1` version.

#### An update affected my application

If you don't use a fixed version, when we release a new version, it could affect your application. This could occur because your application is relying on undocumented or deprecated features, or because of a bug or bug fix we have introduced.

As a workaround, you can use an older version by using a fixed version. See the previous point.

In case you were relying on undocumented or deprecated features, you should consider that workaround a temporal measurement. You should also update your application, so it no longer uses them.

On the other hand, if you are facing a newly introduced bug, you are welcome to [open an issue](https://github.com/cartodb/carto-vl/issues/new) or use other [support options](/developers/carto-vl/support/support-options/).


### Updates frequency

Although we tend to do a release every six weeks, we don't have a fixed schedule for new CARTO VL releases. However, if we planned to release a specific feature, we might delay a release. Also, in the case of critical regressions, we will make a bug fix release before the next major/minor release happens.

In case you need to use a new feature before it is released, [you can always build your own custom CARTO VL bundle](https://github.com/CartoDB/carto-vl/blob/master/DEVELOPERS.md).

### Version support

In any given moment, the last three released major/minor versions are available. If `v1.2.0` were the last released version, we will support:
 - `v1.2.0`.
 - `v1.1.0`, or `v1.1.1` if for any reason we released a bug fix version of the `v1.1` minor version.
 - `v1.0.0`.

### Version checks

For debugging, use the `carto.version` property to obtain the current version of CARTO VL in your application.
