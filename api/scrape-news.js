import Parser from "rss-parser";

const parser = new Parser();

export default async function handler(req, res) {
  try {
    // 🔥 Multiple feeds (add more later if needed)
    const feeds = [
      "https://feeds.feedburner.com/ndtvnews-rajasthan",
      "https://feeds.feedburner.com/ndtvnews-top-stories"
    ];

    // 🔥 Your target keywords (Hindi + English mix)
    const keywords = [
      "rajasthan",
      "jaipur",
      "bikaner",
      "jhunjhunu",
      "pilani",
      "chirawa",
      "jodhpur",
      "udaipur",
      "kota",
      "ajmer",
      "sikar",
      "alwar",
      "bharatpur",
      "पाली",
      "जयपुर",
      "बीकानेर",
      "झुंझुनूं",
      "पिलानी",
      "चिड़ावा",
      "जोधपुर",
      "उदयपुर",
      "कोटा",
      "अजमेर",
      "सीकर",
      "अलवर"
    ];

    let allArticles = [];

    // 🔥 Fetch all feeds
    for (let feedUrl of feeds) {
      const feed = await parser.parseURL(feedUrl);

      const items = feed.items.map(item => ({
        title: item.title || "",
        url: item.link || "",
        content: item.contentSnippet || "",
        source: "NDTV"
      }));

      allArticles = allArticles.concat(items);
    }

    // 🔥 FILTER Rajasthan + city-based news
    const filtered = allArticles.filter(article => {
      const text = (article.title + " " + article.content).toLowerCase();

      return keywords.some(k => text.includes(k.toLowerCase()));
    });

    // 🔥 REMOVE DUPLICATES
    const unique = [];
    const seen = new Set();

    for (let item of filtered) {
      if (!seen.has(item.title)) {
        seen.add(item.title);
        unique.push(item);
      }
    }

    res.status(200).json(unique.slice(0, 20));

  } catch (err) {
    console.error("RSS ERROR:", err);

    res.status(500).json({
      error: "RSS failed",
      message: err.message
    });
  }
}