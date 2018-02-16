## CARTO GL

CARTO GL is a JavaScript library to create custom location intelligence applications that leverage the power of [CARTO](https://carto.com/).

It uses [WebGL](https://www.khronos.org/webgl/) to enable powerful Vector maps.

![](./doc/carto-gl-capture.png)

## Getting Started

[TBD]

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/CartoDB/renderer-prototype/tags).

## Submitting Contributions

You will need to sign a Contributor License Agreement (CLA) before making a submission. [Learn more here.](https://carto.com/contributions/)

## License

This project is licensed under the BSD 3-clause "New" or "Revised" License - see the [LICENSE.txt](LICENSE.txt) file for details.

## Development

### Install the dependencies

```
yarn
```

### Run the tests

```
yarn test
```

To watch the unit tests

```
yarn test:watch
```

To launch the unit tests in the browser

```
yarn test:browser
```

Note: you need to configure the CHROME_BIN variable before running the tests, for example:

```
export CHROME_BIN=/usr/bin/chromium-browser
```

### Build the library

```
yarn build
```

To watch the files

```
yarn build:watch
```

### Generate the docs

```
yarn docs
```

To generate all the docs

```
yarn docs:all
```
