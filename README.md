# CARTO GL

[![CircleCI](https://circleci.com/gh/CartoDB/renderer-prototype.svg?style=svg)](https://circleci.com/gh/CartoDB/renderer-prototype)

CARTO GL is a JavaScript library to create custom location intelligence applications that leverage the power of [CARTO](https://carto.com/).

It uses [WebGL](https://www.khronos.org/webgl/) to enable powerful Vector maps.

![](./docs/images/carto-gl-capture.png)

## Documentation and examples

You **need to generate the documentation to have an up to date version**.


### Public documentation

This is intended for the end-user of the library. It's available in the directory `docs/public` and it contains:
 - Getting started introduction with a basic example.
 - Detailed information about how styling expressions.
 - Full reference for the public API.

For generating the public documentation, you should run:

```
yarn docs
```

### Serve docs and examples

The recommended way to navigate the documentation and check the examples is running the following command:

```
yarn serve
```

### Internal documentation

It's also possible to generate a full reference for all the private classes and methods. This will be useful for anyone working on the project internals.

To generate the docs for the private API, you need to execute:

```
yarn docs:all
```

## License

This project is licensed under the BSD 3-clause "New" or "Revised" License - see the [LICENSE.txt](LICENSE.txt) file for details.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/CartoDB/renderer-prototype/tags).

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

### Run the tests

- [Unit tests](./test/unit/README.md)
- [Integration tests](./test/integration/README.md)
- [Acceptance tests](./test/acceptance/README.md)

### Submitting Contributions

You will need to sign a Contributor License Agreement (CLA) before making a submission. [Learn more here.](https://carto.com/contributions/)