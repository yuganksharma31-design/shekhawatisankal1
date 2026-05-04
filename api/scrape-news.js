import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const results = [];

    // ===== NDTV =====
    const ndtvRes = await fetch("https://rajasthan.ndtv.in/", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const ndtvHtml = await ndtvRes.text();
    const $ndtv = cheerio.load(ndtvHtml);

    const baseNDTV = "https://rajasthan.ndtv.in";

    $ndtv("a[href*='/news/']").each((i, el) => {
      const title = $ndtv(el).text().trim();
      const url = $ndtv(el).attr("href");

      const fullUrl = url.startsWith("http") ? url : baseNDTV + url;

      if (title.length > 30) {
        results.push({
          title,
          url: fullUrl,
          source: "NDTV"
        });
      }
    });

    // ===== NEWS18 =====
    const news18Res = await fetch("https://hindi.news18.com/rajasthan/", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const news18Html = await news18Res.text();
    const $news18 = cheerio.load(news18Html);

    const baseNews18 = "https://hindi.news18.com";

    $news18("a[href*='/news/']").each((i, el) => {
      const title = $news18(el).text().trim();
      const url = $news18(el).attr("href");

      const fullUrl = url.startsWith("http") ? url : baseNews18 + url;

      if (title.length > 30) {
        results.push({
          title,
          url: fullUrl,
          source: "News18"
        });
      }
    });

    // ===== REMOVE DUPLICATES =====
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
    console.error(err);

    res.status(500).json({
      error: "Scraping failed",
      message: err.message
    });
  }
}