#!/bin/bash

yarn

VERSION=$(node --eval "console.log(require('./package.json').version);")

yarn test || exit 1
yarn test:user || exit 1

echo "Ready to publish CARTO VL version $VERSION"
echo "Has the version number been bumped?"
read -n1 -r -p "Press Ctrl+C to cancel, or any other key to continue." key

yarn build

echo "Uploading to CDN..."

node scripts/cdn/publish.js
node scripts/cdn/invalidate.js

echo "Uploading to npm..."

# npm publish

echo "All done."
