const jwt = require('jsonwebtoken')
const secretKey= process.env.SECRET_KEY
const bcrypt = require('bcrypt')
var Profile = require('./models/profile');

let blacklist = new Set();

var adminList = ["admin@gmail.com"];

exports.getToken = (userId, email) =>{
    var token = jwt.sign({userId: userId, email: email},secretKey,{expiresIn: 3600})
    return token
}

exports.verifyToken =(req,res,next)=>{
    let token = req.headers['authorization'];
    token =token.replace("Bearer ","")
    if(!token){
        return res.status(403).json({error: "Token not provided"})
    }
    if(blacklist.has(token)){
        return res.status(401).json({message:"Please login "})
    }
    else{
        jwt.verify(token,secretKey,(err,decoded)=>{
            if(err){
                return res.status(401).json({error: "Unauthorized"})
            }
            req.user= decoded.userId
            req.token = token
            next();
        })
    }
}

exports.createPasswordHash=async(password)=>{
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    return hashedPassword;
}

exports.verifyPassword= async(password, hashpassword)=>{
    const match = await bcrypt.compare(password, hashpassword)
    return match
}

exports.blackListToken = async(token)=>{
    blacklist.add(token);
    return true
}

exports.verifyAdmin = async(req,res,next)=>{
    let pr = await Profile.findOne({userId: req.user});
    if (pr.admin){
        next()
    }
    else if (adminList.includes(pr.email)){
        await Profile.findOneAndUpdate({userId: req.user},{admin: true});
        next()
    }
    else{
        return res.status(401).json({message: "Only admind are allowed to access this data"})
    }
}