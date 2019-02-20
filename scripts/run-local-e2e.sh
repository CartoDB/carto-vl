#!/bin/bash

ALREADY_UP="$(docker ps |grep `cat .docker.run | cut -c 1-12`|wc -l)"

if [ "$ALREADY_UP" -eq "0" ]; then
    echo Running
    docker run -d -p 127.0.0.1:8181:8181 -v `pwd`/test/acceptance/docker:/mnt carto/windshaft-cartovl-testing ./deploy.sh > .docker.run
fi

yarn build:clean && yarn build:dev && yarn wait-on "http://127.0.0.1:8181" && mocha test/acceptance/e2e.test.js --timeout 15000 "$@";

# docker kill `cat .docker.run`
