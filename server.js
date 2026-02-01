const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static("public"));

/* ---------------- DATA ---------------- */

const users = {
  admin: {
    username: "admin",
    password: "565811",
    nickname: "BROKE ADMIN",
    avatar: "",
    bio: "Администратор",
    id: "0001",
    nft: [],
    isAdmin: true
  }
};

const channels = {};
const sessions = {};

/* ---------------- AUTH ---------------- */

app.post("/api/auth", (req, res) => {
  const { username, password } = req.body;

  if (!users[username]) {
    users[username] = {
      username,
      password,
      nickname: username,
      avatar: "",
      bio: "",
      id: null,
      nft: [],
      isAdmin: false
    };
  }

  if (users[username].password !== password) {
    return res.status(401).json({ error: "Wrong password" });
  }

  const token = Math.random().toString(36);
  sessions[token] = username;

  res.json({ token, user: users[username] });
});

/* ---------------- SOCKET ---------------- */

io.on("connection", socket => {

  socket.on("login", token => {
    const username = sessions[token];
    if (!username) return;
    socket.username = username;
    socket.emit("profile", users[username]);
  });

  socket.on("message", data => {
    io.emit("message", {
      from: socket.username,
      text: data
    });
  });

  socket.on("sendNFT", ({ to, img }) => {
    if (!users[to]) return;
    users[to].nft.push(img);
    io.emit("profileUpdate", users[to]);
  });

  socket.on("createChannel", ({ name, username }) => {
    channels[username] = {
      name,
      username,
      owner: socket.username,
      posts: [],
      views: 0,
      subs: 0
    };
    io.emit("channels", channels);
  });

  socket.on("channelPost", ({ channel, text }) => {
    if (channels[channel].owner !== socket.username) return;
    channels[channel].posts.push({ text, time: Date.now() });
    io.emit("channels", channels);
  });

  socket.on("adminBoost", ({ channel, views, subs }) => {
    if (!users[socket.username].isAdmin) return;
    channels[channel].views += views;
    channels[channel].subs += subs;
    io.emit("channels", channels);
  });

  socket.on("adminID", ({ user, id }) => {
    if (!users[socket.username].isAdmin) return;
    users[user].id = id;
    io.emit("profileUpdate", users[user]);
  });

});

server.listen(3000, () => {
  console.log("🔥 BROKE server running on http://localhost:3000");
});
