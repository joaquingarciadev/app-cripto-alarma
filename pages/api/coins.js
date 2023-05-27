import axios from "axios";
const cheerio = require("cheerio");

export default async function handler(req, res) {
  try {
    const toNumber = (string) => {
      return parseFloat(string.replace("$", "").replace(",", ""));
    };
    const criptos = [];
    const response = await axios(process.env.NEXT_PUBLIC_SCRAPE_URL);
    const html = await response.data;
    const $ = cheerio.load(html);
    $("table tbody tr").each((id, elem) => {
      if (
        $(elem).find(".cmc-table__column-name--name.cmc-link").text() !== ""
      ) {
        criptos.push({
          name: $(elem).find(".cmc-table__column-name--name.cmc-link").text(),
          symbol: $(elem)
            .find(".cmc-table__cell--sort-by__symbol > div")
            .text(),
          price: toNumber($(elem).find(".clgqXO .cmc-link span").text()),
        });
      }
    });
    res.send(criptos);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
}