#!/bin/bash
# Use this command to get download images from circleci
#
# Usage:
# bash circleci.sh <port> <host> <filename> 
scp -P $0 circleci@$1://home/circleci/repo/test/acceptance/references/basic/$3 $3
