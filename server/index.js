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

const port = 4000 || process.env.PORT;

mongoose.set('strictQuery', false);
mongoose.connect(process.env.DB_URL);


app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));

app.get("/",(req,res)=>{
    res.json("test ok")
    
})

app.use("/",authRoutes)

app.listen(port,()=>{
    console.log("Server running at http://localhost:4000")

})