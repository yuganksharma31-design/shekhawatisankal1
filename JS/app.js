/* ===========================
   LOAD HOME PAGE ARTICLES
=========================== */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  "https://snicsrpjkecogyepkhrk.supabase.co/",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuaWNzcnBqa2Vjb2d5ZXBraHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0Mzg2ODMsImV4cCI6MjA5MzAxNDY4M30.0PCzEXXtvMTitvL1Oqq5jN4kqPIdrQhAPgrzPXnBi2E"
)
async function loadHome() {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Error:", error);
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
   OPEN SINGLE ARTICLE
=========================== */

function openArticle(id) {
  window.location.href = "/article.html?id=" + id;
}

function loadSingleArticle() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) return;

  fetch("/article/" + id)
    .then(res => res.json())
    .then(a => {
      document.getElementById("title").innerText = a.title;
      document.getElementById("content").innerHTML = a.content;

      if (a.image) {
        document.getElementById("image").src = a.image;
      }
    });
}

/* ===========================
   EDITOR PANEL - LOAD ARTICLES
=========================== */

async function loadEditorArticles() {

  const table = document.getElementById("articlesTable");
  if (!table) return;

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Error:", error);
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

function deleteArticle(id) {
  if (!confirm("Delete this article?")) return;

async function deleteArticle(id) {

  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete error:", error);
    alert("Delete failed");
  } else {
    alert("Deleted ✅");
    loadEditorArticles();
  }
}
}

/* ===========================
   PAGE AUTO LOAD DETECTOR
=========================== */

window.onload = () => {
  // Homepage
  if (document.getElementById("news")) {
    loadHome();
  }

  // Single article page
  if (document.getElementById("content")) {
    loadSingleArticle();
  }

  // Editor panel
  if (document.getElementById("articlesTable")) {
    loadEditorArticles();
  }
};
const form = document.getElementById("articleForm");

if (form) {
  form.onsubmit = function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    fetch("/article", {
      method: "POST",
      body: formData
    })
    .then(res => res.text())
    .then(msg => {
      alert(msg);

      // refresh editor table
      if (typeof loadEditorArticles === "function") {
        loadEditorArticles();
      }

      form.reset();
    })
    .catch(err => console.error(err));
  };
}