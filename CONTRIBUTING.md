# Contribution guide

## Setup development environment

You need to have the current [Node LTS version](https://nodejs.org/en/) installed and for the sake of simplicity I assume
that your npm is working properly. (Test using ``$ npm version``)

In your copy of the **dauntless-builder** directory, use the following in your shell:

```shell
# First we need to install yarn via:
npm install -g yarn

# Install/update all dependencies via
yarn

# If it's a clean install or there were changes to data in the last pull you'll need to do a full build once
yarn build

# Then rebuilding assets can be done with
yarn build-dev

# Optional: you can also watch/build data...
# yarn build-dev --watch

# Next run your webserver via
yarn dev
```

Done, you have a version of this app running on localhost:4000.

## Updates to .map/vX.json

If your pull request changes something in data/ make sure to make a build and update the string map cache in .map.

## English Language

Because Dauntless is developed by a Canadian company, we decided to use canadian/british english instead of
american english (which I usually prefer).

## How to enable Developer Mode

Dauntless-Builder.com has a special developer menu / mode which gives you access to some extra information
that might help you contributing. To enable developer mode, open the console of your web browser and enter:

```js
enableDeveloperMode();
```

And confirm that with an ENTER.

## Contact

If for some reason you need to contact me, just hit me up via email [me(at)atomicptr.de](mailto:me@atomicptr.de).
