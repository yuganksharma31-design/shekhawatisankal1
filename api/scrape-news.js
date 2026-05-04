import Parser from "rss-parser";

const parser = new Parser();

export default async function handler(req, res) {
  try {
    // 🔥 Better feeds (Hindi + regional)
    const feeds = [
      "https://feeds.feedburner.com/ndtvnews-top-stories",
      "https://feeds.feedburner.com/ndtvnews-india-news",
      "https://feeds.feedburner.com/ndtvnews-cities"
    ];

    const keywords = [
      "rajasthan","jaipur","bikaner","jhunjhunu","pilani","chirawa",
      "jodhpur","udaipur","kota","ajmer","sikar","alwar",
      "जयपुर","बीकानेर","झुंझुनूं","पिलानी","चिड़ावा","जोधपुर",
      "राजस्थान"
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

      } catch (e) {
        console.log("Feed failed:", url);
      }
    }

    // 🔥 Filter (LESS STRICT now)
    const filtered = allArticles.filter(article => {
      const text = (article.title + " " + article.content).toLowerCase();

      return keywords.some(k => text.includes(k.toLowerCase()));
    });

    // 🔥 If nothing found → show fallback (important)
    const finalData = filtered.length > 0 ? filtered : allArticles;

    res.status(200).json(finalData.slice(0, 15));

  } catch (err) {
    console.error(err);
    res.status(200).json([]);
  }
}