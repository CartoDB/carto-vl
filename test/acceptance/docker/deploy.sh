#!/bin/bash

git clone https://github.com/CartoDB/Windshaft-cartodb.git ;

cp /srv/config/environments/test.js Windshaft-cartodb/config/environments/development.js
cd ./Windshaft-cartodb/

git checkout 6.5.1
git pull origin 6.5.1

npm ci

cd /srv
echo "port 6335" | redis-server - > ./redis.log &
PID_REDIS=$!
echo ${PID_REDIS} > ${BASEDIR}/redis.pid

/etc/init.d/postgresql start

cd /mnt/Windshaft-cartodb/
node app.js development
