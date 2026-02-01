const socket = io();

const authBlock = document.getElementById("auth");
const appBlock = document.getElementById("app");

const loginInput = document.getElementById("login");
const passwordInput = document.getElementById("password");

const messages = document.getElementById("messages");
const msg = document.getElementById("msg");

let token = localStorage.getItem("token");

if (token) init();

function auth() {
  fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: loginInput.value,
      password: passwordInput.value
    })
  })
  .then(r => r.json())
  .then(d => {
    token = d.token;
    localStorage.setItem("token", token);
    init();
  })
  .catch(() => alert("Ошибка входа"));
}

function init() {
  authBlock.style.display = "none";
  appBlock.classList.remove("hidden");
  socket.emit("login", token);
}

function send() {
  if (!msg.value) return;
  socket.emit("message", msg.value);
  msg.value = "";
}

socket.on("message", m => {
  messages.innerHTML += `<div><b>${m.from}:</b> ${m.text}</div>`;
  messages.scrollTop = messages.scrollHeight;
});
