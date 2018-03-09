# Acceptance tests

a.k.a E2E tests

The idea of this tests is to automatically test the **entire stack**, including the library, the renderer and the integration with the backend.

This is done through iterative screenshot testing, comparing `test` screenshots against its reference images. These tests are defined in the `scenario.js` file:

```
e2e
├── test1
│   └── scenario.js
└─── test2
│   └── scenario.js
...
```

## Generating the references

```
yarn build
yarn test:e2e:prepare
```

After this process the ignored file `scenario.hml` is created. If the test does not have a `reference.png` image, it will be automatically created.

```
test1
├── scenario.html
├── scenario.js
└── reference.png
```

If you want to regenerate all the references run `yarn test:e2e:clean` before.

## Running the tests

```
yarn build
yarn test:e2e
```

After this process the ignored files `scenario.hml` and `reference_out.png` are created:

```
test1
├── scenario.html
├── scenario.js
├── reference_out.png
└── reference.png
```


**Note**: you may need to configure the CHROME_BIN variable before running the tests, for example:

```
export CHROME_BIN=/usr/bin/chromium-browser
```
