const express = require("express")
const sqlite3 = require("sqlite3").verbose()
const bodyParser = require("body-parser")
const multer = require("multer")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))

app.get("/", (req, res) => {
res.sendFile(__dirname + "/public/index.html")
})

/* ---------------- IMAGE UPLOAD ---------------- */

const storage = multer.diskStorage({
destination: (req, file, cb) => cb(null, "public/uploads"),
filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
})

const upload = multer({ storage })

/* ---------------- DATABASE ---------------- */

const db = new sqlite3.Database("database.db")

db.serialize(() => {

db.run(`CREATE TABLE IF NOT EXISTS users(
id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT,
password TEXT,
role TEXT
)`)

db.run(`CREATE TABLE IF NOT EXISTS articles(
id INTEGER PRIMARY KEY AUTOINCREMENT,
title TEXT,
content TEXT,
image TEXT,
category TEXT,
author TEXT,
date TEXT
)`)

db.run(`CREATE TABLE IF NOT EXISTS analytics(
id INTEGER PRIMARY KEY AUTOINCREMENT,
page TEXT
)`)

db.run(`CREATE TABLE IF NOT EXISTS comments(
id INTEGER PRIMARY KEY AUTOINCREMENT,
article_id INTEGER,
text TEXT
)`)

db.run("INSERT OR IGNORE INTO users(id,username,password,role) VALUES (1,'admin','admin123','admin')")
db.run("INSERT OR IGNORE INTO users(id,username,password,role) VALUES (2,'editor','editor123','editor')")

})

/* ---------------- LOGIN ---------------- */

app.post("/login",(req,res)=>{

const {username,password} = req.body

db.get(
"SELECT * FROM users WHERE username=? AND password=?",
[username,password],
(err,row)=>{

if(row) res.json(row)
else res.status(401).send("Invalid login")

})

})

/* ---------------- CREATE ARTICLE ---------------- */

app.post("/article", upload.single("image"), (req,res)=>{

const {title,content,author,category} = req.body
const image = req.file ? "/uploads/" + req.file.filename : ""

db.run(
"INSERT INTO articles(title,content,image,category,author,date) VALUES(?,?,?,?,?,datetime('now'))",
[title,content,image,category,author]
)

res.send("Article published")

})

/* ---------------- GET ALL ARTICLES ---------------- */

app.get("/articles",(req,res)=>{

db.all(
"SELECT * FROM articles ORDER BY id DESC",
(err,rows)=>res.json(rows)
)

})

/* ---------------- GET SINGLE ARTICLE ---------------- */

app.get("/article/:id",(req,res)=>{

db.get(
"SELECT * FROM articles WHERE id=?",
[req.params.id],
(err,row)=>res.json(row)
)

})

/* ---------------- DELETE ARTICLE ---------------- */

app.delete("/article/:id",(req,res)=>{

db.run(
"DELETE FROM articles WHERE id=?",
[req.params.id],
()=>res.send("deleted")
)

})

/* ---------------- UPDATE ARTICLE ---------------- */

app.put("/article/:id",(req,res)=>{

const {title,content,category} = req.body

db.run(
"UPDATE articles SET title=?,content=?,category=? WHERE id=?",
[title,content,category,req.params.id],
()=>res.send("updated")
)

})

/* ---------------- TRACK ARTICLE VIEW ---------------- */

app.post("/track-view",(req,res)=>{

db.run(
"INSERT INTO analytics(page) VALUES(?)",
[req.body.page]
)

res.send("tracked")

})

/* ---------------- SEARCH ARTICLES ---------------- */

app.get("/search",(req,res)=>{

const q = "%" + req.query.q + "%"

db.all(
"SELECT * FROM articles WHERE title LIKE ?",
[q],
(e,rows)=>res.json(rows)
)

})

/* ---------------- ADMIN DASHBOARD STATS ---------------- */

app.get("/admin/stats",(req,res)=>{

db.get(
"SELECT COUNT(*) AS articles FROM articles",
(err,a)=>{

db.get(
"SELECT COUNT(*) AS views FROM analytics",
(err,v)=>{

res.json({
articles: a ? a.articles : 0,
views: v ? v.views : 0
})

})

})

})

/* ---------------- SERVER ---------------- */

app.listen(PORT,()=>{
console.log("Pilani AAJ running at http://localhost:" + PORT)
})