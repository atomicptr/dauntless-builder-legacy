const express = require("express");

const app = express();

app.use(express.static("."));

function deliverFile(fileName) {
    const options = {
        root: process.cwd(),
        dotfiles: "deny"
    };

    return (req, res, next) => {
        res.sendFile(fileName, options, err => {
            if (err) {
                console.error(err);
                next(err)
            }
        })
    };
}

app.get("/data.json", deliverFile("dist/data.json"));
app.get("/meta.json", deliverFile("dist/meta.json"));
app.get("/map/names.json", deliverFile(".map/names.json"));
app.get("/*", deliverFile("index.html"));

app.listen(4000);