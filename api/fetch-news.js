export default async function handler(req, res) {
  try {
    const apiKey = "YOUR_API_KEY";

    const url = `https://gnews.io/api/v4/search?q=rajasthan OR jaipur OR jodhpur OR udaipur&lang=hi&country=in&max=10&token=${apiKey}`;

    const response = await fetch(url);

    // 🔥 IMPORTANT: check response
    if (!response.ok) {
      return res.status(500).json({
        error: "GNews API failed",
        status: response.status
      });
    }

    const data = await response.json();

    // 🔥 IMPORTANT: ensure articles exist
    if (!data.articles) {
      return res.status(500).json({
        error: "No articles found",
        fullResponse: data
      });
    }

    res.status(200).json(data.articles);

  } catch (error) {
    console.error("API ERROR:", error);

    res.status(500).json({
      error: "Failed to fetch news",
      details: error.message
    });
  }
}