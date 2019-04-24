#!/usr/bin/env bash

### delete old version of the repository
rm -rf deploy

### create new deploy directory
mkdir deploy

### copy files and assets
rsync -r assets/ deploy/assets/
mkdir -p deploy/dist/
cp dist/*.js deploy/dist/
cp *.html deploy/
cp misc/* deploy/

### copy data files to deploy
mkdir -p deploy/map/
cp dist/data.json deploy/data.json
cp dist/meta.json deploy/meta.json
cp .map/*.json deploy/map/
