#!/usr/bin/env bash

### Used Variables
# GIT_REMOTE_URL
# COMMIT_MESSAGE

if [ -z "$GIT_REMOTE_URL" ]; then
    GIT_REMOTE_URL="git@github.com:atomicptr/dauntless-builder.git"
fi

if [ -z "$COMMIT_MESSAGE" ]; then
    COMMIT_MESSAGE="manual build"
fi

### delete old version of the repository
rm -rf deploy

### clone new version
git clone --depth 1 --branch gh-pages $GIT_REMOTE_URL deploy

### copy files and assets
rsync -r assets/ deploy/assets/
mkdir -p deploy/dist/
cp dist/dauntless-builder.js deploy/dist/
cp dist/embed.js deploy/dist/
cp *.html deploy/
cp CNAME deploy/

### copy data files to deploy
mkdir -p deploy/map/
cp dist/data.json deploy/data.json
cp .map/*.json deploy/map/

### go into deploy and actually deploy
if [[ $1 == "--commit" ]]; then
    pushd deploy
    git add -A
    git commit -m "$COMMIT_MESSAGE"
    git push origin gh-pages
    popd
fi