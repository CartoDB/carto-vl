# Acceptance tests

The idea of this tests is to automatically test the entire stack, including the library, the renderer and the integration with the backend.

This is done through screenshot testing, comparing `test-cases` screenshots against reference images stored in the `references` folder.

## Generating the references

    yarn test:acceptance:prepare

## Running the tests

    yarn test:acceptance


This will generate a `<filename>_out.png` for every test case so you can visually compare the results if the test fails.
