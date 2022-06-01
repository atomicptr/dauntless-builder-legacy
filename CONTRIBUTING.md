# Contribution guide

## Setup development environment

You need to have the current [Node LTS version](https://nodejs.org/en/) installed and for the sake of simplicity I
assume
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

In order to create a translation for an item, edit its yaml file like this:

```yaml
name: Agents of Decay
description: A Slayer's aether strikers forged with Agarus trophies.
icon: /assets/icons/weapons/agarus/AgentsOfDecay.png
type: Aether Strikers
damage: Blunt
elemental: Terra
cells: [ Prismatic, Prismatic ]
power:
  base: 100
  powerSurged: 120
bond:
  elemental: Terra
unique_effects:
  - name: AgarusLegendaryAbility
    icon: /assets/icons/abilities/AgarusLegendaryWeaponAbility.png
    description: |
      Legendary Ability: Revive all Slayers in a large radius, granting them healing over time and immunity to stagger. Usable while downed.

i18n:
  de:
    name: New item name in German
    description: New description that has been overwritten!
    unique_effects:
      - description: SCHMETTERLING!
  jp:
    name: 新しいアイテム
```

This will create new translation entries in src/translations/items.

You might notice that this is kinda terrible if the entry contains data like for instance this example:

```yaml
unique_effects:
  - name: CharrogSpentStaminaFireDamage
    description: >-
      After spending 150 stamina, next attack emits a cone of flame that deals +100 blaze damage to each unique target within the cone
    value: 100
    powerSurged: false
  - name: CharrogSpentStaminaFireDamage
    description: >-
      After spending 150 stamina, next attack emits a cone of flame that deals +200 blaze damage to each unique target within the cone
    value: 200
    powerSurged: true
```

Instead of translating the strings **with** the values included you can extract them into the new values field. By doing
this
the text snippets will usually end up being the same, so it's also recommended to use YAML variables to reduce
duplication.

```yaml
unique_effects:
  - name: CharrogSpentStaminaFireDamage
    description: &charrogUeDescription >-
      After spending {{stamina}} stamina, next attack emits a cone of flame that deals +{{blazeDamage}} blaze damage to each unique target within the cone
    value: 100
    powerSurged: false
    values:
      description:
        stamina: 150
        blazeDamage: 100
  - name: CharrogSpentStaminaFireDamage
    description: *charrogUeDescription
    value: 200
    powerSurged: true
    values:
      description:
        stamina: 150
        blazeDamage: 200
```

## Contact

If you find an issue or want to provide feedback please use
[Github Issues](https://github.com/atomicptr/dauntless-builder/issues), join the
[Dauntless Builder Discord Server](https://discord.gg/hkMvhsfPjH) or the
[Dauntless Builder Matrix Channel](https://matrix.to/#/#dauntlessbuilder:matrix.org).
