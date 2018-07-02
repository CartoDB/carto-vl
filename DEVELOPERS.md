# Developers

* [Getting Started](#setup)
* [Testing](#testing)
* [Documentation](#documentation)

## <a name="setup"> Getting started </a>

To build the library node `node >=6.11.5` is required, once you have a compatible node version you can start developing.

### Install dependencies

    yarn

### Build the library

    yarn build

## <a name="testing"> Testing </a>

- [Unit tests](https://github.com/CartoDB/carto-vl/blob/master/test/unit/README.md)
- [Integration tests](https://github.com/CartoDB/carto-vl/blob/master/test/integration/README.md)
- [Acceptance tests](https://github.com/CartoDB/carto-vl/blob/master/test/acceptance/README.md)

## <a name="documentation"> Documentation </a>

You **can generate generate the documentation to have an up to date version**.

### Public documentation

This is intended for the end-user of the library. It's available in the directory `docs/public` and it contains:
 - Getting started introduction with a basic example.
 - Detailed information about how styling expressions.
 - Full reference for the public API.

For generating the public documentation, you should run:

    yarn docs

### Serve docs and examples

The recommended way to navigate the documentation and check the examples is running the following command:

    yarn serve

### Internal documentation

It's also possible to generate a full reference for all the private classes and methods. This will be useful for anyone working on the project internals.

To generate the docs for the private API, you need to execute:

    yarn docs:all
