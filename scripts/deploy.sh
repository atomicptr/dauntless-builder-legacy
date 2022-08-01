#!/usr/bin/env bash
cp -r dist deploy
cp .netlify/config/* deploy/

ls -al deploy
cat deploy/_redirects
