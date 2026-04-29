/* ===========================
   SUPABASE INIT
=========================== */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  "https://snicsrpjkecogyepkhrk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuaWNzcnBqa2Vjb2d5ZXBraHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0Mzg2ODMsImV4cCI6MjA5MzAxNDY4M30.0PCzEXXtvMTitvL1Oqq5jN4kqPIdrQhAPgrzPXnBi2E"
)

/* ===========================
   HOME PAGE
=========================== */
async function loadHome() {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  renderHome(data);
}

function renderHome(data) {
  const container = document.getElementById("news");
  if (!container) return;

  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = "<p>No news available</p>";
    return;
  }

  data.forEach(a => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${a.image || 'https://picsum.photos/400/200'}" />
      <h3>${a.title}</h3>
      <p>${a.content.substring(0, 120)}...</p>
      <button onclick="openArticle(${a.id})">Read More</button>
    `;

    container.appendChild(card);
  });
}

/* ===========================
   OPEN ARTICLE
=========================== */
function openArticle(id) {
  window.location.href = "/article.html?id=" + id;
}

/* ===========================
   SINGLE ARTICLE
=========================== */
async function loadSingleArticle() {

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return;

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  document.getElementById("title").innerText = data.title;
  document.getElementById("content").innerHTML = data.content;

  if (data.image) {
    document.getElementById("image").src = data.image;
  }
}

/* ===========================
   EDITOR - LOAD
=========================== */
async function loadEditorArticles() {

  const table = document.getElementById("articlesTable");
  if (!table) return;

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  table.innerHTML = "";

  data.forEach(a => {
    table.innerHTML += `
      <tr>
        <td>${a.title}</td>
        <td>${a.category}</td>
        <td>${a.date || "-"}</td>
        <td>
          <button onclick="deleteArticle(${a.id})">Delete</button>
        </td>
      </tr>
    `;
  });
}

/* ===========================
   DELETE ARTICLE
=========================== */
async function deleteArticle(id) {

  if (!confirm("Delete this article?")) return;

  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Delete failed");
  } else {
    alert("Deleted ✅");
    loadEditorArticles();
  }
}

/* ===========================
   CREATE ARTICLE
=========================== */
const form = document.getElementById("articleForm");

if (form) {
  form.onsubmit = async function (e) {

    e.preventDefault();

    const formData = new FormData(this);

    const title = formData.get("title");
    const content = formData.get("content");
    const category = formData.get("category");
    const author = formData.get("author");

    const { error } = await supabase
      .from("articles")
      .insert([
        {
          title,
          content,
          category,
          author,
          image: "",
          date: new Date()
        }
      ]);

    if (error) {
      console.error(error);
      alert("Error saving article");
    } else {
      alert("Article Published ✅");
      loadEditorArticles();
      form.reset();
    }
  };
}

/* ===========================
   AUTO LOAD
=========================== */
window.onload = () => {

  if (document.getElementById("news")) {
    loadHome();
  }

  if (document.getElementById("content")) {
    loadSingleArticle();
  }

  if (document.getElementById("articlesTable")) {
    loadEditorArticles();
  }
};