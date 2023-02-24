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
    jwt.verify(token,process.env.JWT_SECRET_KEY,{},(err,decoded)=>{
        if(err){
            res.json({
                message:err?.message
            })
        }
     
        res.status(200).json(decoded)
    })

})

router.post("/login", async (req,res)=>{
    const {username,password} = req.body;
    const user = await User.findOne({username});
    if(user){
        const validPass = bcrypt.compareSync(password,user.password)
        if(validPass){

            const token = jwt.sign({userId:user._id,username},process.env.JWT_SECRET_KEY,{expiresIn:"1h"} )    
    
            res.cookie('token',token,{sameSite:'none',secure:true}).status(200).json({
                id:user._id,
                username,
            });

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


module.exports = router