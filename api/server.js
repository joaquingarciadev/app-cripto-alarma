const express = require("express");
const app = express();
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require("cors")());

const axios = require("axios");
const cheerio = require("cheerio");

// Convert the string to a number
const toNumber = (string) => {
    return parseFloat(string.replace("$", "").replace(",", ""));
};

app.get("/", async (req, res) => {
    const criptos = [];

    const response = await axios(process.env.URL);
    const html = await response.data;
    const $ = cheerio.load(html);
    $("table tbody tr").each((id, elem) => {
        if ($(elem).find(".cmc-table__column-name--name.cmc-link").text() !== "") {
            criptos.push({
                img: $(elem).find(".cmc-table__column-name--name.cmc-link img").attr("src"),
                name: $(elem).find(".cmc-table__column-name--name.cmc-link").text(),
                symbol: $(elem).find(".cmc-table__cell--sort-by__symbol > div").text(),
                price: toNumber($(elem).find(".cLgOOr .cmc-link span").text()),
            });
        }
    });
    res.send(criptos);
});

app.listen(process.env.PORT);
