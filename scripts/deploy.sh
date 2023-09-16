#!/usr/bin/env bash
set -ex

# install and setup bun
if [[ ! $(command -v bun) ]]; then
	curl -fsSL https://bun.sh/install | bash
	export PATH="/opt/buildhome/.bun/bin:~/.bun/bin:$PATH"
fi

bun --version

# install dependencies and build project
bun install
bun run build

# "deploy" project
cp -r dist deploy
cp .netlify/config/* deploy/
