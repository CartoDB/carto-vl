#!/bin/bash

ALREADY_UP="$(docker ps |grep `cat .docker.run | cut -c 1-12`|wc -l)"

if [ "$ALREADY_UP" -eq "0" ]; then
    echo Running
    docker run -d -p 127.0.0.1:8181:8181 -v `pwd`/test/acceptance/docker:/mnt carto/windshaft-cartovl-testing ./deploy.sh > .docker.run
fi

TESTS_HOSTNAME=localhost.localhost.lan
valid_hostname() {
    node -e "const hostname = '${TESTS_HOSTNAME}'; require('dns').lookup(hostname, (err, address) => { if (err) { console.error('Could not resolve hostname \"%s\", reason %s', hostname, err.message); return process.exit(1); } })"
}
valid_hostname && yarn build:dev && yarn wait-on "http://${TESTS_HOSTNAME}:8181" && mocha test/acceptance/e2e.test.js --timeout 15000 "$@";

# docker kill `cat .docker.run`
