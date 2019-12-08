import flatten from "flat";

export default flatten({
    name: "Français",
    ui: require("./ui.json"),
    builder: require("./builder.json"),
    game: require("./game.json")
});
