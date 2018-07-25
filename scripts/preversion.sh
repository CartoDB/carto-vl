#!/bin/bash

yarn
yarn test || exit 1
yarn test:render || exit 1

VERSION=$(node --eval "console.log(require('./package.json').version);")

echo "Ready to bump CARTO VL version $VERSION"
echo "Do you want to continue?"
read -n1 -r -p "Press Ctrl+C to cancel, or any other key to continue." key

# Then, npm version is executed.
