# Contribution guide

## Setup development environment

You need to have the current [Node LTS version](https://nodejs.org/en/) installed and for the sake of simplicity I assume
that your npm is working properly. (Test using `$ npm version`)

In your copy of the **dauntless-builder** directory, use the following in your shell:

```shell
# First we need to install yarn via:
npm install -g yarn

# Install/update all dependencies via
yarn

# If it's a clean install or there were changes to data in the last pull you'll need to do a full build once
yarn build

# Start the development server
yarn dev
```

Done, you have a version of this app running on http://localhost:3000.

## Updates to .map/vX.json

If your pull request changes something in data/ make sure to make a build and update the string map cache in .map.

## English Language

Because Dauntless is developed by a Canadian company, we decided to use canadian/british english instead of
american english (which I usually prefer).

## Translations

If you want to translate Dauntless Builder into a new language (or fix a language string) check out src/i18n.ts and
src/translations.

## Contact

If you find an issue or want to provide feedback please use
[Github Issues](https://github.com/atomicptr/dauntless-builder/issues) or join the
[Dauntless Builder Discord](https://discord.gg/hkMvhsfPjH) server.
