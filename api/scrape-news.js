import Parser from "rss-parser";

const parser = new Parser();

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

    for (const item of feed.items) {
      const text = (item.title + " " + (item.contentSnippet || "")).toLowerCase();

      const isRajasthan = keywords.some(k => text.includes(k));
      const isHindi = /[\u0900-\u097F]/.test(item.title);

      if (!isRajasthan || !isHindi) continue;

      results.push({
        title: item.title,
        url: item.link,   // ✅ KEEP GOOGLE LINK
        source: "Google News"
      });
    }

    console.log("NEWS COUNT:", results.length);

    res.status(200).json(results.slice(0, 20));

  } catch (err) {
    console.error(err);
    res.status(200).json([]);
  }
}