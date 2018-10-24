# Developers

CARTO VL is an open-source library. We are more than happy to receive your contributions to the code and its documentation.

## <a name="prerequisites">Prerequisites</a>

To clone and run this library, you'll need [Node.js](https://nodejs.org/en/download/) >=6.11.5 (which comes with [npm](http://npmjs.com)) installed on your computer.

## <a name="install">Install</a>

Run this commands from your command line:

```bash
# Clone this repository
$ git clone https://github.com/CartoDB/carto-vl

# Go into the repository
$ cd carto-vl

# Install dependencies
$ yarn

# Bundle the library
$ yarn build
```

## <a name="documentation">Document your changes</a>

This is intended for the end-user of the library and it's the source of [CARTO VL's Official Documentation](https://carto.com/developers/carto-vl/). It's available in the directory `docs/public`.

```bash
# Generate the public documentation
$ yarn docs

# Serve docs and examples
$ yarn serve
```

## <a name="tests">Tests</a>

### Unit tests

<!-- Add description -->

```bash
# Running the tests
$ yarn test

# To watch the unit tests
$ yarn test:watch

# To launch the unit tests in the browser
$ yarn test:browser
```

### Integration tests

Automatically test the **user activity** using local data sources (GeoJSON).

```bash
# Running the tests
$ yarn test:user

# To watch the user tests
$ yarn test:user:watch
```

With these you can also test the **renderer** using local data sources (GeoJSON) and a static map. The local GeoJSON files are located in the `common/sources` directory.

```bash
# Running the tests
$ yarn test:render
```

#### Generating new references

To create new tests, crate a new folder with a new `scenario.js` file and run the following command:

```
yarn test:render:prepare
```

#### Modify old references

Manually remove your old reference images and run this command to create new ones:

```
yarn test:render:prepare
```

#### Filtering tests

Adding `f-` at the beginning of any test folder marks this test to be executed without the rest of the tests.

#### Ignoring tests

Adding `x-` at the beginning of any test folder marks this test to be ignored.

### Acceptance tests (E2E tests)

This end to end tests cover the entire library by performing tests against real servers. This is done through iterative screenshot testing, comparing `test` screenshots against its reference images. To achieve real E2E testing, a Windshaft-cartodb server is deployed within a Docker container.

To install Docker, follow the instructions on https://docs.docker.com/install/

```bash
# Running the tests
$ yarn test:e2e
```

To rebuild the Docker image run: `docker build -t carto/windshaft-cartovl-testing test/acceptance/docker/`

#### Generating new references

To create new tests, crate a new folder with a new `scenario.js` file and run the following command:

```
yarn test:e2e:prepare
```

#### Modify old references

Manually remove your old reference images and run this command to create new ones:

```
yarn test:e2e:prepare
```

#### Filtering tests

Adding `f-` at the beginning of any test folder marks this test to be executed without the rest of the tests.

#### Ignoring tests

Adding `x-` at the beginning of any test folder marks this test to be ignored.

## Release

First create a release. This command bumps the version, creates a tag and uploads all to GitHub.

```
yarn version
```

Then, use this command to publish to our `CDN` and `npm`.

```
yarn publish
```

NOTE: `yarn publish` calls `yarn version` at the beginning of the process. If you don't want to bump the version just press `Enter` to skip the prompt and use the current version instead.
