import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const url = "https://rajasthan.ndtv.in/";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const results = [];
    const base = "https://rajasthan.ndtv.in";

    // 🔥 More flexible selector
    $("a").each((i, el) => {
      const title = $(el).text().trim();
      let link = $(el).attr("href");

      // only news links
      if (link && link.includes("/news/")) {

        const fullUrl = link.startsWith("http") ? link : base + link;

        // avoid garbage links
        if (title.length > 40) {
          results.push({
            title,
            url: fullUrl,
            source: "NDTV Rajasthan"
          });
        }
      }
    });

    // 🔥 remove duplicates
    const unique = [];
    const seen = new Set();

    for (let item of results) {
      if (!seen.has(item.title)) {
        seen.add(item.title);
        unique.push(item);
      }
    }

    res.status(200).json(unique.slice(0, 15));

  } catch (err) {
    console.error("SCRAPER ERROR:", err);

    res.status(200).json([]);
  }
}