import Parser from "rss-parser";
import axios from "axios";

const parser = new Parser();

// 🔥 Get REAL article URL (remove Google redirect)
async function getRealUrl(googleUrl) {
  try {
    const res = await axios.get(googleUrl, {
      maxRedirects: 10,
      validateStatus: () => true,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const finalUrl = res.request?.res?.responseUrl;

    // ❌ skip invalid or still Google links
    if (!finalUrl || finalUrl.includes("news.google.com")) {
      return null;
    }

    return finalUrl;

  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  try {

    // 🔥 Google News RSS (Hindi + Rajasthan)
    const feedUrl =
      "https://news.google.com/rss/search?q=rajasthan&hl=hi&gl=IN&ceid=IN:hi";

    const feed = await parser.parseURL(feedUrl);

    // 🔥 Rajasthan + cities keywords
    const keywords = [
      "राजस्थान","जयपुर","बीकानेर","झुंझुनूं","पिलानी","चिड़ावा",
      "जोधपुर","उदयपुर","कोटा","अजमेर","सीकर","अलवर"
    ];

    const results = [];

    for (const item of feed.items) {

      const text = (item.title + " " + (item.contentSnippet || "")).toLowerCase();

      const isRajasthan = keywords.some(k => text.includes(k.toLowerCase()));
      const isHindi = /[\u0900-\u097F]/.test(item.title);

      if (!isRajasthan || !isHindi) continue;

      // 🔥 Convert to real URL
      const realUrl = await getRealUrl(item.link);

      if (!realUrl) continue;

      // 🔥 avoid duplicates
      if (results.some(r => r.url === realUrl)) continue;

      results.push({
        title: item.title,
        url: realUrl,
        source: "Google News"
      });
    }

    console.log("FINAL NEWS COUNT:", results.length);

    // 🔥 fallback (never empty UI)
    const finalData =
      results.length > 0
        ? results
        : feed.items.map(i => ({
            title: i.title,
            url: i.link,
            source: "Google News"
          }));

    res.status(200).json(finalData.slice(0, 20));

  } catch (err) {
    console.error("ERROR:", err.message);
    res.status(200).json([]);
  }
}