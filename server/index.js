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

app.get("/", (req, res) => {
  res.json("test ok");
});

app.use("/auth", authRoutes);

const server = app.listen(port, () => {
  console.log("Server running at http://localhost:4000");
});

const ws_server = new ws.WebSocketServer({ server });
ws_server.on("connection", (connection, req) => {
  // console.log("connected")
  // connection.send("hello")

  const cookies = req.headers.cookie;
  if (cookies) {
   
    const tokenString = cookies
      .split(";")
      .find((str) => str.startsWith("token="));
    if (tokenString) {
      const token = tokenString.split("=")[1];
      const userData = jwt.verify(token,process.env.JWT_SECRET_KEY);
   
   
      if(userData){
        //   console.log(userData)
          const {userId,username} = userData;
            connection.userId = userId;
            connection.username = username;
      }
    }
  }
  // ws_server.clients
  [...ws_server.clients].forEach((client)=>{
        client.send(JSON.stringify(
           {
            online: [...ws_server.clients].map(c=>({userId:c.userId,username:c.username}))
           }
        ))
  })
});
