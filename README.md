# Dauntless Builder (Legacy)

This is the repository of Dauntless Builder from a time before "Dauntless Awakened" released, please head over to the new repository here:

- [https://github.com/atomicptr/dauntless-builder](https://github.com/atomicptr/dauntless-builder)

----

# dauntless-builder

[![Build Status](https://github.com/atomicptr/dauntless-builder/actions/workflows/tests.yml/badge.svg)](https://github.com/atomicptr/dauntless-builder/actions/workflows/tests.yml)
[![Crowdin](https://badges.crowdin.net/dauntless-builder/localized.svg)](https://crowdin.com/project/dauntless-builder)

<p align="center">
    <img height="160px" src="https://raw.githubusercontent.com/atomicptr/dauntless-builder/master/public/assets/icon.png" />
</p>

Create and share Dauntless builds with your friends!

![Screenshot of Dauntless Builder](docs/assets/app-screenshot.png)

## Documentation

-   [Data Documentation](docs/DATA.md) - How data is set up, how to contribute, how to use our data in your application.
-   [Data Deprecations](docs/DEPRECATIONS.md) - Things that have been or will be removed from the public facing data "api"
-   [Localization Documentation](docs/LOCALIZATION.md) - How the translation system works, how to contribute translations etc.

## Localization

We're using Crowdin for managing localizations: https://crowdin.com/project/dauntless-builder

## Development Setup

Requirements:

-   Linux / MacOS / WSL v2+, regular Windows is unsupported
-   Node.js 18+ (Non LTS versions are unsupported)

```bash
# Assumption: You have already cloned the repository and are inside the directory
# Install dependencies
$ npm install
# Build dependency data (item data, i18n files, about page stuff, etc.)
$ npm run build:deps
# Run the development environment
$ npm run dev
```

You should now have Dauntless Builder running on your system via http://localhost:3000
(port might be different).

## Notes

### Data changes & the map file

If you change something in data/ make sure to call `npm run build:data` which will update .map/names.json
and include that in your pull request.

### English Language

Because Dauntless is developed by a Canadian company, we decided to use Canadian/British English instead of
American English.

## Contact

If you find an issue or want to provide feedback please use
[Github Issues](https://github.com/atomicptr/dauntless-builder/issues), join the
[Dauntless Builder Discord Server](https://discord.gg/hkMvhsfPjH) or the

## Assets

All Dauntless related assets are the property of Phoenix Labs.

The collected data itself is public domain.

## License

[![](https://www.gnu.org/graphics/agplv3-155x51.png)](<https://tldrlegal.com/license/gnu-affero-general-public-license-v3-(agpl-3.0)>)
