import flatten from "flat";

export default flatten({
    name: "English",
    ui: require("./ui.json"),
    builder: require("./builder.json"),
    game: require("./game.json")
});
