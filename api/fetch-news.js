export default async function handler(req, res) {
  try {
    const apiKey = "607a770709491bc910990f3ea1fd2f39"; // your key

    const url = `https://gnews.io/api/v4/search?q=rajasthan&lang=hi&max=10&token=${apiKey}`;

    console.log("Fetching from:", url);

    const response = await fetch(url);

    const text = await response.text(); // 🔥 important

    console.log("RAW RESPONSE:", text);

    const data = JSON.parse(text);

    if (!response.ok) {
      return res.status(500).json({
        error: "GNews API failed",
        full: data
      });
    }

    res.status(200).json(data.articles || []);

  } catch (error) {
    console.error("ERROR:", error);

    res.status(500).json({
      error: "Server error",
      message: error.message
    });
  }
}