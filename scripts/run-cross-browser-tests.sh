#!/bin/bash
yarn serve &
yarn wait-on "http://localhost:8080" && mocha test/browsers/browsers.test.js;
