function render(data){

const container = document.getElementById("news")

container.innerHTML = ""

data.forEach(a => {

const card = document.createElement("div")

card.className = "card"

card.innerHTML = `
<img src="${a.image || 'https://picsum.photos/400/200'}">

<h3>${a.title}</h3>

<p>${a.content.substring(0,120)}...</p>

<button onclick="openArticle(${a.id})">
Read More
</button>
`

container.appendChild(card)

loadHome()
function loadHome(){

fetch("/articles")

.then(res => res.json())

.then(data => render(data))

}

})

}