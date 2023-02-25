const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const authRoutes = require("./routes/authRoutes");
const ws = require("ws");
const Message = require("./models/Message");
const fs = require("fs");

const port = 4000 || process.env.PORT;

mongoose.set("strictQuery", false);
mongoose.connect(process.env.DB_URL);

app.use("/uploads",express.static(__dirname+"/uploads"))
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({
      message: "Token not found",
    });
  }

  try {
    const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
    req.userData = { ...decoded };

    next();
  } catch(err) {
    // err
    res.clearCookie("token").status(400).json({
        message:err?.message
    })
  }

  
};

app.get("/", (req, res) => {
  res.json("test ok");
});

app.use("/auth", authRoutes);

app.get("/messages/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;
  const { userData } = req;
  // Message.find({
  //     $or:[
  //         {sender:userData.userId,recipient:userId},
  //         {sender:userId,recipient:userData.userId}
  //     ]

  // })
  // .populate("sender")
  // .populate("recipient")
  // .then((messages)=>{
  //     res.json(messages)
  // })
  // .catch((err)=>{
  //     res.json(err)
  // })

  const messages = await Message.find({
    sender: { $in: [userData.userId, userId] },
    recipient: { $in: [userData.userId, userId] },
  }).sort({ createdAt: 1 });

  res.json(messages);
});

app.get("/people", async (req, res) => {
  const users = await User.find({}).select("_id username");
  res.json(users);
});

const server = app.listen(port, () => {
  console.log("Server running at http://localhost:4000");
});

const ws_server = new ws.WebSocketServer({ server });

ws_server.on("connection", (connection, req) => {
  // console.log("connected")
  // connection.send("hello")

  const notifyAboutOnlineUsers = () => {
    // notify everyone when a new user joins (online peoples)
    [...ws_server.clients].forEach((client) => {
      client.send(
        JSON.stringify({
          online: [...ws_server.clients].map((c) => ({
            userId: c.userId,
            username: c.username,
          })),
        })
      );
    });
  };

  connection.isAlive = true;
  connection.timer = setInterval(() => {
    connection.ping();

    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      notifyAboutOnlineUsers();
      console.log("death");
    }, 1000);
  }, 5000);

  connection.on("pong", () => {
    clearTimeout(connection.deathTimer);
  });

  // read username and id from the cookie for this connection
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenString = cookies
      .split(";")
      .find((str) => str.startsWith("token="));
    if (tokenString) {
      const token = tokenString.split("=")[1];
      try {
        const userData = jwt.verify(token, process.env.JWT_SECRET_KEY);
        //   console.log(userData)

        if (userData) {
          //   console.log(userData)
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
        }
      } catch (err) {
        // console.log("error from socket ",err);
      }
    }
  }

  connection.on("message", async (message, isBinary) => {
    // console.log(isBinary)
    let fileName;
    const msg = JSON.parse(message.toString());
    // console.log(msg);
    const { recipient, sender, text, file } = msg;
    if (file) {
      // console.log(file)
      const parts = file.name.split(".");
      const ext = parts[parts.length - 1];
      fileName = `${Date.now()}.${ext}`;
      const path = __dirname + "/uploads/" + fileName;
      const bufferData = Buffer.from(file.data.split(",")[1], "base64");

      fs.writeFile(path, bufferData, () => {
        console.log("file saved ", path);
      });
    }
    if (recipient && (text || file)) {
      const msgDoc = await Message.create({
        sender,
        recipient,
        text,
        file: file ? fileName : null,
      });
      // find the receiver
      const receiver = [...ws_server.clients].filter(
        (c) => c.userId === recipient
      );
      if (receiver) {
        receiver.forEach((client) => {
          client.send(
            JSON.stringify({
              sender: sender,
              text,
              recipient,
              file:file ? fileName:null,
              _id: msgDoc._id,
            })
          );
        });
      }
    }
  });

  notifyAboutOnlineUsers();
});
