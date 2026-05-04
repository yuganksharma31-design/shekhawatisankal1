import Parser from "rss-parser";

const parser = new Parser();

export default async function handler(req, res) {
  try {

    const feed = await parser.parseURL(
      "https://feeds.feedburner.com/rajasthan.ndtv.in"
    );

    const keywords = [
      "rajasthan","jaipur","bikaner","jhunjhunu","pilani","chirawa",
      "jodhpur","udaipur","kota","ajmer","sikar","alwar",
      "राजस्थान","जयपुर","बीकानेर","झुंझुनूं","पिलानी","चिड़ावा","जोधपुर"
    ];

    const filtered = feed.items.filter(item => {
      const text = (item.title + " " + (item.contentSnippet || "")).toLowerCase();

      const isRajasthan = keywords.some(k => text.includes(k.toLowerCase()));

      // 🔥 Hindi check (very important)
      const isHindi = /[\u0900-\u097F]/.test(item.title);

      return isRajasthan && isHindi;
    });

    const results = filtered.map(item => ({
      title: item.title,
      url: item.link,
      source: "NDTV"
    }));

    res.status(200).json(results.slice(0, 15));

  } catch (err) {
    console.error(err);
    res.status(200).json([]);
  }
}