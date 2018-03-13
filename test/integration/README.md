
# Integration tests

a.k.a Render tests

The idea of these tests is to automatically test the **renderer** using local data sources (GeoJSON) and a static map. The local GeoJSON files are located in the `common/sources` directory.

This is done through iterative screenshot testing, comparing `test` screenshots against its reference images. These tests are defined in the `scenario.js` file:

```
render
├── category
│   ├── test1
│   │   └── scenario.js
│   └── test2
│       └── scenario.js
│
...
```

## Generating the references

```
yarn build
yarn test:render:prepare
```

After this process the ignored file `scenario.hml` is created. If the test does not have a `reference.png` image, it will be automatically created.

```
test1
├── scenario.html
├── scenario.js
└── reference.png
```

If you want to regenerate all the references run `yarn test:render:clean` before.

## Running the tests

```
yarn build
yarn test:render
```

After this process the ignored files `scenario.hml` and `reference_out.png` are created:

```
test1
├── scenario.html
├── scenario.js
├── reference_out.png
└── reference.png
```

## Filtering tests

Adding `f-` at the beginning of any test folder marks this test to be executed without the rest of the tests.

## Ignoring tests

Adding `x-` at the beginning of any test folder marks this test to be ignored.


**Note**: you may need to configure the CHROME_BIN variable before running the tests, for example:

```
export CHROME_BIN=/usr/bin/chromium-browser
```
