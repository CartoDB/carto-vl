****# CARTO VL

[![CircleCI](https://circleci.com/gh/CartoDB/carto-vl.svg?style=svg)](https://circleci.com/gh/CartoDB/carto-vl)

[CARTO VL](https://github.com/cartodb/carto-vl) is a JavaScript library to create custom location intelligence applications that leverage the power of [CARTO](https://carto.com/). It uses [WebGL](https://www.khronos.org/webgl/) to enable powerful **Vector maps**.

| ![](https://github.com/CartoDB/carto-vl/blob/master/docs/images/points.png) | ![](https://github.com/CartoDB/carto-vl/blob/master/docs/images/lines.png) |
|---|---|
| ![](https://github.com/CartoDB/carto-vl/blob/master/docs/images/aggregation.png) | ![](https://github.com/CartoDB/carto-vl/blob/master/docs/images/polygons.png) |


## Documentation and examples

 - [Documentation overview](https://carto.com/developers/carto-vl/): for all the public documentation resources.
 - [Getting started guide](https://carto.com/developers/carto-vl/guides/getting-started/): the best resource to begin using it.
 - [Full reference API](https://carto.com/developers/carto-vl/reference/): for specific methods, arguments, and sample code.
 - [Examples](https://carto.com/developers/carto-vl/examples/).

### Generate documentation

You **can generate generate the documentation to have an up to date version**.

#### Public documentation

This is intended for the end-user of the library. It's available in the directory `docs/public` and it contains:
 - Getting started introduction with a basic example.
 - Detailed information about how styling expressions.
 - Full reference for the public API.

For generating the public documentation, you should run:

```
yarn docs
```

#### Serve docs and examples

The recommended way to navigate the documentation and check the examples is running the following command:

```
yarn serve
```

#### Internal documentation

It's also possible to generate a full reference for all the private classes and methods. This will be useful for anyone working on the project internals.

To generate the docs for the private API, you need to execute:

```
yarn docs:all
```


## License

This project is licensed under the BSD 3-clause "New" or "Revised" License - see the [LICENSE.txt](LICENSE.txt) file for details.


## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/CartoDB/carto-vl/tags).


## Development

### Install the dependencies

```
yarn
```

### Build the library

```
yarn build
```

To watch the files

```
yarn build:watch
```

### Releasing a version

#### Update the version
Remember we follow [SemVer](http://semver.org/) rules.

    yarn bump:patch|minor|major

#### Publishing the library
Once you have your `secrets.json` file configured run

    yarn release

This will upload the library to [npm](https://www.npmjs.com/) and into our CDN. 

### Run the tests

- [Unit tests](https://github.com/CartoDB/carto-vl/blob/master/test/unit/README.md)
- [Integration tests](https://github.com/CartoDB/carto-vl/blob/master/test/integration/README.md)
- [Acceptance tests](https://github.com/CartoDB/carto-vl/blob/master/test/acceptance/README.md)

### Submitting Contributions

You will need to sign a Contributor License Agreement (CLA) before making a submission. [Learn more here.](https://carto.com/contributions/)
