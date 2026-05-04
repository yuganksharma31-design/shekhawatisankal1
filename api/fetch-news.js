export default async function handler(req, res) {
  try {
    const apiKey = "607a770709491bc910990f3ea1fd2f39";

    const url = `https://gnews.io/api/v4/search?q=rajasthan OR jaipur OR jodhpur OR udaipur OR kota OR Jhunjhunu &lang=hi&country=in&max=10&token=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    return res.status(200).json(data.articles);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch news" });
  }
}