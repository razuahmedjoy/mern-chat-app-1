const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.get("/profile",(req,res)=>{
    const token = req.cookies?.token;
   
    if(!token){
        return res.status(401).json({
            message:"Token not found"
        })
    }

    try {
        var decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
        res.status(200).json(decoded)
      } catch(err) {
        // err
        res.clearCookie("token").status(400).json({
            message:err?.message
        })
      }
   

})

router.post("/login", async (req,res)=>{
    const {username,password} = req.body;
    const user = await User.findOne({username});
    if(user){
        const validPass = bcrypt.compareSync(password,user.password)
        if(validPass){

            const token = jwt.sign({userId:user._id,username},process.env.JWT_SECRET_KEY,{expiresIn:"1d"} )    
    
            res.cookie('token',token,{sameSite:'none',secure:true}).status(200).json({
                id:user._id,
                username,
            });

        }
        else{
            res.status(400).json({
                message:"Invalid Credentials"
            })
        }
    }

})
router.post("/register", async (req,res)=>{
    
    const {username,password} = req.body;

    try{
        const salt =  bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password,salt);
        const user = await User.create({username,password:hashedPassword});
        const token = jwt.sign({userId:user._id,username},process.env.JWT_SECRET_KEY,{expiresIn:"1h"} )    
    
        res.cookie('token',token,{sameSite:'none',secure:true}).status(201).json({
            id:user._id,
            username,
        });
    }
    catch(err){
        res.status(400).json({
            message:err?.message
        })
    }

})

router.post("/logout", async (req,res)=>{

    res.clearCookie("token").status(200).json({
        message:"Logout successful",
        success:true

    })

})

module.exports = router