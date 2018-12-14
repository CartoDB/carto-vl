#!/bin/bash

VERSION=$(node --eval "console.log(require('./package.json').version);")

echo "Ready to publish CARTO VL version $VERSION"
echo "Has the version number been bumped?"
read -n1 -r -p "Press Ctrl+C to cancel, or any other key to continue." key

echo "Uploading to CDN..."

node scripts/cdn/publish.js 'release'
node scripts/cdn/invalidate.js

echo "Uploading to npm..."

# Then, npm publish is executed.
