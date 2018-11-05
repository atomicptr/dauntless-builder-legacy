#!/usr/bin/env bash

### delete old version of the repository
rm -rf deploy

### create new deploy directory
mkdir deploy

### copy files and assets
rsync -r assets/ deploy/assets/
mkdir -p deploy/dist/
cp dist/dauntless-builder.js deploy/dist/
cp dist/embed.js deploy/dist/
cp *.html deploy/
cp CNAME deploy/
cp _redirects deploy/
cp _headers deploy/

### copy data files to deploy
mkdir -p deploy/map/
cp dist/data.json deploy/data.json
cp .map/*.json deploy/map/
