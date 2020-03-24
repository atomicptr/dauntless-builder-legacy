const fs = require("fs");
const path = require("path");
const assign = require("object-assign-deep");

const actual = require("../i18n/fr/game.json");
const input = require("../in.json");

assign(actual, input);

fs.writeFileSync(
    path.join(__dirname, "..", "i18n", "fr", "game.json"),
    JSON.stringify(actual, null, 4)
);
