#!/bin/bash
# lsof -ti:8080 | xargs kill # kill http_server
yarn serve &
yarn wait-on "http://localhost:8080" && mocha test/browsers/browsers.test.js;
