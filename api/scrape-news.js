import Parser from "rss-parser";

const parser = new Parser();

export default async function handler(req, res) {
  try {
    const feeds = [
      "https://feeds.feedburner.com/ndtvnews-top-stories"
    ];

    const keywords = [
      "rajasthan","jaipur","bikaner","jhunjhunu","pilani","chirawa",
      "jodhpur","udaipur","kota","ajmer","sikar","alwar",
      "जयपुर","बीकानेर","झुंझुनूं","पिलानी","चिड़ावा","जोधपुर"
    ];

    let allArticles = [];

    for (let url of feeds) {
      try {
        const feed = await parser.parseURL(url);

        feed.items.forEach(item => {
          allArticles.push({
            title: item.title || "",
            url: item.link || "",
            content: item.contentSnippet || "",
            source: "NDTV"
          });
        });

      } catch (feedError) {
        console.log("Feed failed:", url);
      }
    }

    // 🔥 FILTER
    const filtered = allArticles.filter(article => {
      const text = (article.title + " " + article.content).toLowerCase();
      return keywords.some(k => text.includes(k.toLowerCase()));
    });

    res.status(200).json(filtered.slice(0, 15));

  } catch (err) {
    console.error("FINAL ERROR:", err);

    res.status(200).json([]); // 👈 IMPORTANT: never break frontend
  }
}