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

const port = 4000 || process.env.PORT;

mongoose.set("strictQuery", false);
mongoose.connect(process.env.DB_URL);

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
  jwt.verify(token, process.env.JWT_SECRET_KEY, {}, async (err, decoded) => {
    if (err) {
      res.json({
        message: err?.message,
      });
    }
    // const {userId,username} = decoded;

    req.userData = { ...decoded };

    next();
  });
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
  }).sort({createdAt:-1});

    res.json(messages);

});

const server = app.listen(port, () => {
  console.log("Server running at http://localhost:4000");
});

const ws_server = new ws.WebSocketServer({ server });
ws_server.on("connection", (connection, req) => {
  // console.log("connected")
  // connection.send("hello")

  // read username and if from the cookie for this connection
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenString = cookies
      .split(";")
      .find((str) => str.startsWith("token="));
    if (tokenString) {
      const token = tokenString.split("=")[1];
      const userData = jwt.verify(token, process.env.JWT_SECRET_KEY);
      //   console.log(userData)

      if (userData) {
        //   console.log(userData)
        const { userId, username } = userData;
        connection.userId = userId;
        connection.username = username;
      }
    }
  }

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

  connection.on("message", async (message, isBinary) => {
    // console.log(isBinary)
    const msg = JSON.parse(message.toString());
    // console.log(msg);
    const { recipient, sender, text } = msg;
    if (recipient && text) {
      const msgDoc = await Message.create({
        sender,
        recipient,
        text,
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
              id: msgDoc._id,
            })
          );
        });
      }
    }
  });
});
