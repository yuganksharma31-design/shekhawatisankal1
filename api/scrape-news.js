import cheerio from "cheerio";

export default async function handler(req, res) {
  try {

    const results = [];

    // ================= NDTV =================
    const ndtvRes = await fetch("https://rajasthan.ndtv.in/");
    const ndtvHtml = await ndtvRes.text();
    const $ndtv = cheerio.load(ndtvHtml);

    $ndtv("h2 a").each((i, el) => {
 const base = "https://rajasthan.ndtv.in";

const title = $ndtv(el).text().trim();
const url = $ndtv(el).attr("href");

// 🔥 FIX RELATIVE LINKS
const fullUrl = url && url.startsWith("http") ? url : base + url;

if (title && fullUrl) {
  results.push({
    title,
    url: fullUrl,   // ✅ use fullUrl here
    source: "NDTV"
  });
}
    });

    // ================= NEWS18 =================
    const news18Res = await fetch("https://hindi.news18.com/rajasthan/");
    const news18Html = await news18Res.text();
    const $news18 = cheerio.load(news18Html);

    $news18("h2 a").each((i, el) => {
        
      const title = $news18(el).text().trim();
      const url = $news18(el).attr("href");
      const base = "https://hindi.news18.com";

const fullUrl = url && url.startsWith("http") ? url : base + url;
      if (title && url) {
        results.push({
          title,
          url,
          source: "News18"
        });
      }
    });

    // ================= CLEAN + LIMIT =================
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
    res.status(500).json({
      error: "Scraping failed",
      message: err.message
    });
  }
}