# Acceptance tests

The idea of this tests is to automatically test the entire stack, including the library, the renderer and the integration with the backend.

This is done through screenshot testing, comparing `test-cases` screenshots against reference images stored in the `references` folder.

## Running the tests

```
yarn test:acceptance
```

## Generating the references

```
yarn test:acceptance:prepare
```


This will generate a `<filename>_out.png` for every test case so you can visually compare the results if the test fails.

**Note**: you need to configure the CHROME_BIN variable before running the tests, for example:

```
export CHROME_BIN=/usr/bin/chromium-browser
```
