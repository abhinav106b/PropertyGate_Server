const jwt = require('jsonwebtoken')
const secretKey= process.env.SECRET_KEY
const bcrypt = require('bcrypt')
var Profile = require('./models/property');
var User = require('./models/user');

let blacklist = new Set();


exports.getToken = (userId, email) =>{
    var token = jwt.sign({userId: userId, email: email},secretKey,{expiresIn: 3600}) // token is signed with userid and email
    return token
}

exports.verifyToken =(req,res,next)=>{
    let token = req.headers['authorization']; //extracts the token from headers
    if(!token){
        return res.status(401).json("Token missing: please register or login")
    }
    token =token.replace("Bearer ","")
    if(!token){
        return res.status(401).json({error: "Please login"})
    }
    if(blacklist.has(token)){ // checks if the token is in blacklist or not
        return res.status(401).json({message:"Please login "})
    }
    else{
        jwt.verify(token,secretKey,async(err,decoded)=>{
            if(err){
                return res.status(401).json({error: "Please login Unauthorized"})
            }
            let role = await User.findById(decoded.userId);
            req.role = role.role;
            req.user= decoded.userId
            req.token = token
            next();
        })
    }
}

exports.createPasswordHash=async(password)=>{ // for hasing password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    return hashedPassword;
}

exports.verifyPassword= async(password, hashpassword)=>{ // to verify the password
    const match = await bcrypt.compare(password, hashpassword)
    return match
}

exports.blackListToken = async(token)=>{
    blacklist.add(token);
    return true
}

exports.verifySeller= async(req,res,next)=>{
    let role = await User.findById(req.user);
    if(role && role.role == 'seller'){
        next();
    }
    else{
        return res.status(401).json({message: "Only seller are allowed to post the property"})
    }
}