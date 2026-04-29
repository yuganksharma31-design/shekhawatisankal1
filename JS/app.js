/* ===========================
   LOAD HOME PAGE ARTICLES
=========================== */

function loadHome() {
  fetch("/articles")
    .then(res => res.json())
    .then(data => renderHome(data))
    .catch(err => console.error("Error:", err));
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

function loadEditorArticles() {
  fetch("/articles")
    .then(res => res.json())
    .then(data => {
      const table = document.getElementById("articlesTable");
      if (!table) return;

      table.innerHTML = "";

      data.forEach(a => {
        table.innerHTML += `
          <tr>
            <td>${a.title}</td>
            <td>${a.category}</td>
            <td>${a.date}</td>
            <td>
              <button onclick="deleteArticle(${a.id})">Delete</button>
            </td>
          </tr>
        `;
      });
    });
}

/* ===========================
   DELETE ARTICLE
=========================== */

function deleteArticle(id) {
  if (!confirm("Delete this article?")) return;

  fetch("/article/" + id, {
    method: "DELETE"
  })
    .then(() => {
      alert("Deleted");
      loadEditorArticles();
    });
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