const socket = io();
let token = localStorage.getItem("token");

if (token) init();

function auth() {
  fetch("/api/auth", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({
      username:login.value,
      password:password.value
    })
  })
  .then(r=>r.json())
  .then(d=>{
    token = d.token;
    localStorage.setItem("token", token);
    init();
  });
}

function init() {
  auth.style.display="none";
  app.classList.remove("hidden");
  socket.emit("login", token);
}

socket.on("profile", u=>{
  nick.innerText = u.nickname;
  user.innerText = u.username;
  uid.innerText = u.id || "-";
  nfts.innerHTML = u.nft.map(n=>`<img src="${n}" width="40">`).join("");
});

socket.on("message", m=>{
  messages.innerHTML += `<div><b>${m.from}:</b> ${m.text}</div>`;
});

socket.on("channels", c=>{
  channelList.innerHTML = Object.values(c).map(ch=>
    `<div>${ch.name} | 👁 ${ch.views} | ⭐ ${ch.subs}</div>`
  ).join("");
});

function send() {
  socket.emit("message", msg.value);
  msg.value="";
}

function show(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function createChannel(){
  socket.emit("createChannel", {
    name:cname.value,
    username:cuser.value
  });
}
