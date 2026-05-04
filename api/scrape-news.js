import Parser from "rss-parser";
const parser = new Parser();

export default async function handler(req, res) {
  try {
    // 🔥 Google News RSS (Hindi + Rajasthan)
    const feedUrl =
      "https://news.google.com/rss/search?q=rajasthan&hl=hi&gl=IN&ceid=IN:hi";

    const feed = await parser.parseURL(feedUrl);

    const keywords = [
      "rajasthan","jaipur","bikaner","jhunjhunu","pilani","chirawa",
      "jodhpur","udaipur","kota","ajmer","sikar","alwar",
      "राजस्थान","जयपुर","बीकानेर","झुंझुनूं","पिलानी","चिड़ावा","जोधपुर"
    ];

    const results = [];

    feed.items.forEach(item => {
      const text = (item.title + " " + (item.contentSnippet || "")).toLowerCase();

      const isRajasthan = keywords.some(k => text.includes(k.toLowerCase()));
      const isHindi = /[\u0900-\u097F]/.test(item.title);

      if (isRajasthan && isHindi) {
        results.push({
          title: item.title,
          url: item.link,
          source: "Google News"
        });
      }
    });

    // 🔥 Fallback (never empty UI)
    const finalData = results.length > 0 ? results : feed.items.map(i => ({
      title: i.title,
      url: i.link,
      source: "Google News"
    }));

    res.status(200).json(finalData.slice(0, 20));

  } catch (err) {
    console.error(err);
    res.status(200).json([]);
  }
}