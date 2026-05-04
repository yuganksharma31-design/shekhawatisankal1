import Parser from "rss-parser";
import axios from "axios";

const parser = new Parser();

// 🔥 Resolve Google redirect → real URL
async function getRealUrl(googleUrl) {
  try {
    const res = await axios.get(googleUrl, {
      maxRedirects: 5,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    return res.request.res.responseUrl;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  try {
    const feedUrl =
      "https://news.google.com/rss/search?q=rajasthan&hl=hi&gl=IN&ceid=IN:hi";

    const feed = await parser.parseURL(feedUrl);

    const keywords = [
      "राजस्थान","जयपुर","बीकानेर","झुंझुनूं","पिलानी","चिड़ावा",
      "जोधपुर","उदयपुर","कोटा","अजमेर","सीकर","अलवर"
    ];

    const results = [];

    // ✅ USE FOR LOOP (NOT forEach)
    for (const item of feed.items) {

      const text = (item.title + " " + (item.contentSnippet || "")).toLowerCase();

      const isRajasthan = keywords.some(k => text.includes(k));
      const isHindi = /[\u0900-\u097F]/.test(item.title);

      if (!isRajasthan || !isHindi) continue;

      // 🔥 get real URL
      const realUrl = await getRealUrl(item.link);

      // ❌ skip if still Google link
      if (!realUrl || realUrl.includes("news.google.com")) continue;

      results.push({
        title: item.title,
        url: realUrl,
        source: "Google News"
      });
    }

    console.log("FINAL NEWS:", results.length);

    res.status(200).json(results.slice(0, 20));

  } catch (err) {
    console.error(err);
    res.status(200).json([]);
  }
}