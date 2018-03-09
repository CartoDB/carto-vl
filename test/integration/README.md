# Integration tests

a.k.a Render tests

## Running the tests

```
yarn test:render
```

## Generating the references

```
yarn test:render:prepare
```

**Note**: you need to configure the CHROME_BIN variable before running the tests, for example:

```
export CHROME_BIN=/usr/bin/chromium-browser
```
