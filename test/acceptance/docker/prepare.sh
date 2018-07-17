#!/bin/bash

OPT_CREATE_REDIS=yes # create the redis test environment
OPT_CREATE_PGSQL=yes # create the PostgreSQL test environment
OPT_DROP_REDIS=yes   # drop the redis test environment
OPT_DROP_PGSQL=yes   # drop the PostgreSQL test environment
OPT_COVERAGE=no      # run tests with coverage
OPT_DOWNLOAD_SQL=yes # download a fresh copy of sql files
OPT_REDIS_CELL=yes   # download redis cell

export PGAPPNAME=cartodb_tiler_tester

cd $(dirname $0)
BASEDIR=$(pwd)
cd -

REDIS_PORT=`node -e "console.log(require('${BASEDIR}/config/environments/test.js').redis.port)"`
export REDIS_PORT

cleanup() {
  if test x"$OPT_DROP_REDIS" = xyes; then
    if test x"$PID_REDIS" = x; then
      PID_REDIS=$(cat ${BASEDIR}/redis.pid)
      if test x"$PID_REDIS" = x; then
        echo "Could not find a test redis pid to kill it"
        return;
      fi
    fi
    redis-cli -p ${REDIS_PORT} info stats
    redis-cli -p ${REDIS_PORT} info keyspace
    echo "Killing test redis pid ${PID_REDIS}"
    #kill ${PID_REDIS_MONITOR}
    kill ${PID_REDIS}
  fi
  if test x"$OPT_DROP_PGSQL" = xyes; then
    # TODO: drop postgresql ?
    echo "Dropping PostgreSQL test database isn't implemented yet"
  fi
}

cleanup_and_exit() {
	cleanup
	exit
}

die() {
	msg=$1
	echo "${msg}" >&2
	cleanup
	exit 1
}

trap 'cleanup_and_exit' 1 2 3 5 9 13

while [ -n "$1" ]; do
        # This is kept for backward compatibility
        if test "$1" = "--nodrop"; then
                OPT_DROP_REDIS=no
                OPT_DROP_PGSQL=no
                shift
                continue
        elif test "$1" = "--nodrop-pg"; then
                OPT_DROP_PGSQL=no
                shift
                continue
        elif test "$1" = "--nodrop-redis"; then
                OPT_DROP_REDIS=no
                shift
                continue
        elif test "$1" = "--nocreate-pg"; then
                OPT_CREATE_PGSQL=no
                shift
                continue
        elif test "$1" = "--nocreate-redis"; then
                OPT_CREATE_REDIS=no
                shift
                continue
        elif test "$1" = "--no-sql-download"; then
                OPT_DOWNLOAD_SQL=no
                shift
                continue
        elif test "$1" = "--with-coverage"; then
                OPT_COVERAGE=yes
                shift
                continue
        # This is kept for backward compatibility
        elif test "$1" = "--nocreate"; then
                OPT_CREATE_REDIS=no
                OPT_CREATE_PGSQL=no
                shift
                continue
        elif test "$1" = "--norediscell"; then
                OPT_REDIS_CELL=no
                shift
                continue
        else
                break
        fi
done

# if [ -z "$1" ]; then
#         echo "Usage: $0 [<options>] <test> [<test>]" >&2
#         echo "Options:" >&2
#         echo " --nocreate   do not create the test environment on start" >&2
#         echo " --nodrop     do not drop the test environment on exit" >&2
#         echo " --with-coverage   use istanbul to determine code coverage" >&2
#         echo " --norediscell  do not download redis-cell" >&2
#         exit 1
# fi

TESTS=$@

if test x"$OPT_CREATE_REDIS" = xyes; then
#   echo "Starting redis on port ${REDIS_PORT}"
#   REDIS_CELL_PATH="${BASEDIR}/test/support/libredis_cell.so"
#   if [[ "$OSTYPE" == "darwin"* ]]; then
#     REDIS_CELL_PATH="${BASEDIR}/test/support/libredis_cell.dylib"
#   fi

  echo "port ${REDIS_PORT}" | redis-server - > ${BASEDIR}/test.log & # --loadmodule ${REDIS_CELL_PATH}
  PID_REDIS=$!
  echo ${PID_REDIS} > ${BASEDIR}/redis.pid
fi

PREPARE_DB_OPTS=
if test x"$OPT_CREATE_PGSQL" != xyes; then
  PREPARE_DB_OPTS="$PREPARE_DB_OPTS --skip-pg"
fi
if test x"$OPT_CREATE_REDIS" != xyes; then
  PREPARE_DB_OPTS="$PREPARE_DB_OPTS --skip-redis"
fi
if test x"$OPT_DOWNLOAD_SQL" != xyes; then
  PREPARE_DB_OPTS="$PREPARE_DB_OPTS --no-sql-download"
fi

echo "Preparing the environment"
cd ${BASEDIR}/test/support
source prepare_db.sh "${PREPARE_DB_OPTS}" || die "database preparation failure"
cd -

PATH=node_modules/.bin/:$PATH

#redis-cli -p ${REDIS_PORT} monitor > /tmp/windshaft-cartodb.redis.log &
#PID_REDIS_MONITOR=$!

# if test x"$OPT_COVERAGE" = xyes; then
#   echo "Running tests with coverage"
#   ./node_modules/.bin/istanbul cover node_modules/.bin/_mocha -- -u tdd -t 5000 ${TESTS}
# else
#   echo "Running tests"
#   ./node_modules/.bin/_mocha -c -u tdd -t 5000 ${TESTS}
# fi
ret=$?

# cleanup
redis-cli -p 6335 shutdown save

exit $ret
