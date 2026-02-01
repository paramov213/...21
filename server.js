const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static("public"));

const users = {
  admin: {
    username: "admin",
    password: "565811",
    nickname: "BROKE ADMIN",
    id: "0001",
    nft: [],
    isAdmin: true
  }
};

const sessions = {};

app.post("/api/auth", (req, res) => {
  const { username, password } = req.body;

  if (!users[username]) {
    users[username] = {
      username,
      password,
      nickname: username,
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

io.on("connection", socket => {

  socket.on("login", token => {
    const username = sessions[token];
    if (!username) return;
    socket.username = username;
    socket.emit("profile", users[username]);
  });

  socket.on("message", text => {
    io.emit("message", { from: socket.username, text });
  });

});

server.listen(3000, () =>
  console.log("BROKE → http://localhost:3000")
);
