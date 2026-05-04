import Parser from "rss-parser";

const parser = new Parser();

export default async function handler(req, res) {
  try {
    // 🔥 MULTIPLE RSS SOURCES (Hindi + Rajasthan)
    const feeds = [
      "https://www.amarujala.com/rss/rajasthan-news.xml",
      "https://zeenews.india.com/hindi/india/rajasthan.xml",
      "https://news.google.com/rss/search?q=rajasthan&hl=hi&gl=IN&ceid=IN:hi"
    ];

    const keywords = [
      "राजस्थान","जयपुर","बीकानेर","झुंझुनूं","पिलानी","चिड़ावा",
      "जोधपुर","उदयपुर","कोटा","अजमेर","सीकर","अलवर"
    ];

    let results = [];

    // 🔁 LOOP ALL FEEDS
    for (const url of feeds) {
      try {
        const feed = await parser.parseURL(url);

        feed.items.forEach(item => {
          const text = (item.title + " " + (item.contentSnippet || "")).toLowerCase();

          const isRajasthan = keywords.some(k => text.includes(k));
          const isHindi = /[\u0900-\u097F]/.test(item.title);

          if (!isRajasthan || !isHindi) return;

          results.push({
            title: item.title,
            url: item.link,   // ✅ REAL URL for AmarUjala/Zee
            source: feed.title || "News"
          });
        });

      } catch (err) {
        console.log("Feed failed:", url);
      }
    }

    // 🔥 REMOVE DUPLICATES
    const unique = [];
    const seen = new Set();

    for (const item of results) {
      if (!seen.has(item.title)) {
        seen.add(item.title);
        unique.push(item);
      }
    }

    console.log("FINAL NEWS COUNT:", unique.length);

    res.status(200).json(unique.slice(0, 20));

  } catch (err) {
    console.error(err);
    res.status(200).json([]);
  }
}