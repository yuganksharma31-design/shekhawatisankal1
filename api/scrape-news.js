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

    // 🔥 NDTV Rajasthan articles
    $("a").each((i, el) => {
      const title = $(el).text().trim();
      let link = $(el).attr("href");

      if (!title || !link) return;

      // only news links
      if (!link.includes("rajasthan") && !link.includes("news")) return;

      // fix relative URLs
      if (!link.startsWith("http")) {
        link = "https://rajasthan.ndtv.in" + link;
      }

      // remove duplicates
      if (results.find(item => item.url === link)) return;

      // only Hindi titles
      const isHindi = /[\u0900-\u097F]/.test(title);
      if (!isHindi) return;

      results.push({
        title,
        url: link,
        source: "NDTV Rajasthan"
      });
    });

    // limit results
    res.status(200).json(results.slice(0, 20));

  } catch (error) {
    console.error("SCRAPER ERROR:", error.message);
    res.status(200).json([]); // never break UI
  }
}