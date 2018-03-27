# User tests

The idea of these tests is to automatically test the **user activity** using local data sources (GeoJSON) and a real map.

## Running the tests

```
yarn test:user
```

To watch the user tests

```
yarn test:user:watch
```


**Note**: you may need to configure the CHROME_BIN variable before running the tests, for example:

```
export CHROME_BIN=/usr/bin/chromium-browser
```
