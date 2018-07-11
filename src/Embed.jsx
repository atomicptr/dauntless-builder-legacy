import React from "react";
import ReactDOM from "react-dom";

import EmbedItem from "./components/embed/EmbedItem";

require("./styles/embeds.scss");

function instantiate(type) {
    return function(elem) {
        const value = elem.dataset["dauntless" + (type.charAt(0).toUpperCase()) + type.substr(1)];

        ReactDOM.render(
            <EmbedItem type={type} value={value} />, elem);
    }
}

window.addEventListener("load", function() {
    if(!window.__dauntless_builder_embedded) {
        console.log("dauntless-builder.com initializing embeds...");

        document.querySelectorAll("[data-dauntless-weapon]").forEach(instantiate("weapon"));
        document.querySelectorAll("[data-dauntless-armour]").forEach(instantiate("armour"));
        document.querySelectorAll("[data-dauntless-lantern]").forEach(instantiate("lantern"));
        document.querySelectorAll("[data-dauntless-build]").forEach(instantiate("build"));

        window.__dauntless_builder_embedded = true;
    }
});