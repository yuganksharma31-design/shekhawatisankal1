import Parser from "rss-parser";
import axios from "axios";

const parser = new Parser();

/* 🔥 Get REAL redirected URL */
async function getRealUrl(googleUrl) {
  try {
    const res = await axios.get(googleUrl, {
      maxRedirects: 5,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    return res.request.res.responseUrl; // ✅ final URL
  } catch (err) {
    console.log("Redirect failed:", googleUrl);
    return googleUrl;
  }
}

export default async function handler(req, res) {
  try {

    const feedUrl =
      "https://news.google.com/rss/search?q=rajasthan&hl=hi&gl=IN&ceid=IN:hi";

    const feed = await parser.parseURL(feedUrl);

    const keywords = [
      "rajasthan","jaipur","bikaner","jhunjhunu","pilani","chirawa",
      "jodhpur","udaipur","kota","ajmer","sikar","alwar",
      "राजस्थान","जयपुर","बीकानेर","झुंझुनूं","पिलानी","चिड़ावा","जोधपुर"
    ];

    const results = [];

    /* 🔥 IMPORTANT: use for...of (not forEach) */
    for (const item of feed.items) {

      const text = (item.title + " " + (item.contentSnippet || "")).toLowerCase();

      const isRajasthan = keywords.some(k => text.includes(k.toLowerCase()));

      // 🔥 (optional) Hindi check — keep loose
      const isHindi = /[\u0900-\u097F]/.test(item.title);

      if (isRajasthan) {

        const realUrl = await getRealUrl(item.link);

        results.push({
          title: item.title,
          url: realUrl,
          source: "Google News"
        });
      }

      // ⚡ limit results (performance)
      if (results.length >= 10) break;
    }

    /* 🔥 fallback (never empty UI) */
    const finalData =
      results.length > 0
        ? results
        : feed.items.slice(0, 10).map(i => ({
            title: i.title,
            url: i.link,
            source: "Google News"
          }));

    res.status(200).json(finalData);

  } catch (err) {
    console.error("API ERROR:", err);
    res.status(200).json([]);
  }
}