# Localization Documentation

Localization in Dauntless Builder is essentially split into two parts:

-   App Localization - Strings on the website itself
-   Item Data Localization - Item name, description, effects etc.

and is powered by [i18next](https://www.i18next.com/).

The English localization is the source of all truths and is used as a fallback if the current user localization
does not contain an entry.

## App Localization

These localization entries are handled by one big JSON file per language and can be found in `src/translations`.

Here is an outtake of the English language file `src/translations/en.json`:

```json
{
    // ...
    "app-name": "Dauntless Builder",
    // ...
    "components": {
        "build-menu": {
            "added-build-to-favorites": "Added build \"{{name}}\" to favorites."
            // ...
        }
    }
    // ...
}
```

Every entry is generally made up of two parts, an identifier (for instance **app-name**) and the associated translation
(in this case **Dauntless Builder**). Identifiers can be split up into sub objects and are referenced in by using a dot
as a separator (components.build-menu.added-build-to-favorites).

Generally if you want to translate something into another language you'd go into the language file of your language, for
instance French would be `src/translations/fr.json` copy over the identifier and add a different translation.

The translation part can also contain variables which are referenced by surrounding them with two curly braces (see {{name}}).

## Item Data Localization

These localization entries are contained within the item data entries.

Lets translate an item!

```yaml
name: Agents of Decay
description: A Slayer's aether strikers forged with Agarus trophies.
icon: /assets/icons/weapons/agarus/AgentsOfDecay.png
type: Aether Strikers
damage: Blunt
elemental: Terra
cells: [Prismatic, Prismatic]
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
```

as you can (maybe) see this item does not feature any translations (yet) by the fact that the **i18n** item is missing.

There are three values here that need to be translated **name**, **description** and the **unique_effect description**.
Everything else is just data.

Lets start by adding the i18n object with a name set for German:

```yaml
# ...
i18n:
    de:
        name: German Name
```

The first level below **i18n** is reserved for language identifiers (see src/i18n.ts for more information) and right below
that we have the identifier we want to overwrite for said language.

Let's add the other entries:

```yaml
# ...
i18n:
    de:
        name: German Name
        description: German Description
        unique_effect:
            - description: German Unique Effect Description
```

similarly we can add as many language as we want, which would make the finished entry look like something like this:

```yaml
name: Agents of Decay
description: A Slayer's aether strikers forged with Agarus trophies.
icon: /assets/icons/weapons/agarus/AgentsOfDecay.png
type: Aether Strikers
damage: Blunt
elemental: Terra
cells: [Prismatic, Prismatic]
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
        name: German Name
        description: German Description
        unique_effect:
            - description: German Unique Effect Description
    ja:
        name: Japanese Name
        description: Japanese Description
        unique_effect:
            - description: Japanese Unique Effect Description
```

Keep in mind to see the changes in the frontend you need to generate translation files
(which will be later located in src/translations/items) using the `yarn build:i18n` command.

### Using variables in translation entries

You might notice that this is kinda terrible if the entry contains data like for instance this example:

```yaml
unique_effects:
    - name: CharrogSpentStaminaFireDamage
      description: >-
          After spending 150 stamina, next attack emits a cone of flame that deals +100 blaze damage to each unique target within the cone
      powerSurged: false
    - name: CharrogSpentStaminaFireDamage
      description: >-
          After spending 150 stamina, next attack emits a cone of flame that deals +200 blaze damage to each unique target within the cone
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
      powerSurged: false
      values:
          stamina: 150
          blazeDamage: 100
    - name: CharrogSpentStaminaFireDamage
      description: *charrogUeDescription
      powerSurged: true
      values:
          stamina: 150
          blazeDamage: 200
```

## Adding a new language

You read what is written above this and want to start contributing but notice your language is missing?

Adding a new language is fairly easy!

Lets say we're adding support for Sindarin (for sake of the example we'll use **si** as the language code).

First lets start by creating the file `src/translations/si.json`

```json
{
    "app-name": "Dauntless tamo"
}
```

(Hint: https://www.elfdict.com/wt/508140)

Next we'll head into `src/i18n.ts` (note the comments):

```ts
import de from "./translations/de.json";
import en from "./translations/en.json";
import fr from "./translations/fr.json";
import enItems from "./translations/items/items.en.json";
// ...

// First lets head to the import block for localizations and add our new file
import si from "./translations/si.json";

// next lets head to the resources object and add our language here as well
const resources = {
    // since we don't have item translations yet we'll only add the app localizations for now
    si: { translation: si },
    en: { translation: { ...en, ...enItems } },
    fr: { translation: { ...fr, ...frItems } },
    ja: { translation: { ...ja, ...jaItems } },
};

// next lets add our language to the Language enum with the language code as a value:
export enum Language {
    English = "en",
    German = "de",
    Japanese = "ja",
    French = "fr",

    // This
    Sindarin = "si",
}

// next we'll add a language native name here aka what the language is named when referenced by natives
const nativeLanguageNames = {
    [Language.English]: "English",
    [Language.German]: "Deutsch",
    [Language.Japanese]: "日本語",
    [Language.French]: "Français",
    // see here:
    [Language.Sindarin]: "Edhellen",
};

// since we just added this language, we should add it to the beta languages list which will warn the user
// that the localization for this language is incomplete.
const betaLanguages = [
    Language.German,
    Language.Japanese,
    Language.French,
    // here!
    Language.Sindarin,
];

// next we'll add our language to the muiLocaleComponent, sadly Sindarin is not (yet) supported by Material UI, maybe you
// should create an issue there?
export const muiLocaleComponent = () =>
    match(i18n.languages[0])
        .with(Language.English, () => enUS)
        .with(Language.German, () => deDE)
        .with(Language.Japanese, () => jaJP)
        .with(Language.French, () => frFR)
        // would be here if it would exist :(
        .with(Language.Sindarin, () => siSi) // keep in mind that siSi in this case is an import from material ui
        .otherwise(() => enUS);
```

And is all you need to do. Now you should be able to select Sindarin in the settings and the title should be
replaced with "Dauntless tamo".

## What translations are missing!?

You don't want to go through the list (understandable) to find that one or two missing keys? There is a script for that!

```bash
$ yarn check:missing-translations
de: "alert.alpha-version" missing
de: "alert.translation-warning" missing
de: "app-name" missing
de: "appbar.dev-menu.translation-check" missing
de: "components.build-menu.added-build-to-favorites" missing
de: "components.build-menu.copied-to-clipboard" missing
de: "components.build-menu.copy-to-clipboard" missing
de: "components.build-menu.favorite-build" missing
de: "components.build-menu.open-last-edited-build" missing
de: "components.build-menu.remove-build-from-favorites" missing
de: "components.build-menu.unfavorite-build" missing
de: "components.build-warning.invalid-build" missing
de: "components.build-warning.upgraded-build" missing
de: "components.item-picker.lantern-hold-line" missing
...
```

if something for English shows up you probably used an invalid key somewhere.
