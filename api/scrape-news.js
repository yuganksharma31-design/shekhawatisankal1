import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const url = "https://rajasthan.ndtv.in/";

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const $ = cheerio.load(data);

    const results = [];

    // ✅ Target real article blocks (NDTV specific)
    $(".news_Itm, .nstory_card, .newsHdng a").each((i, el) => {

      const title = $(el).text().trim();
      let link = $(el).attr("href");

      if (!title || !link) return;

      // fix relative URLs
      if (!link.startsWith("http")) {
        link = "https://rajasthan.ndtv.in" + link;
      }

      // filter Hindi
      const isHindi = /[\u0900-\u097F]/.test(title);
      if (!isHindi) return;

      // avoid duplicates
      if (results.some(item => item.url === link)) return;

      results.push({
        title,
        url: link,
        source: "NDTV Rajasthan"
      });
    });

    console.log("SCRAPED:", results.length);

    res.status(200).json(results.slice(0, 20));

  } catch (error) {
    console.error("SCRAPER ERROR:", error.message);
    res.status(200).json([]);
  }
}