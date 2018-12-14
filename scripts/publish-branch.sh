#!/bin/bash

BRANCH=$(git branch | grep -e "^*" | tr -d '* ';)

# TODO check branch exists
echo "Ready to publish CARTO VL branch '$BRANCH'"
echo "Do you want to continue?"
read -n1 -r -p "Press Ctrl+C to cancel, or any other key to continue." key

echo "Uploading to CDN..."

node scripts/cdn/publish.js 'current_branch'
node scripts/cdn/invalidate.js
