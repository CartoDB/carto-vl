#!/bin/bash
lsof -ti:8080 | xargs kill # kill http_server
yarn serve &
HTTP_SERVER_PID=$!
yarn wait-on "http://localhost:8080" && mocha test/browsers/browsers.test.js;
kill $HTTP_SERVER_PID
