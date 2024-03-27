const express = require('express');
var router = express.Router();
const bosyParser = require('body-parser');
router.use(bosyParser.json());
var authenticate = require('../authenticate')
var Profile = require('../models/profile')
const helper = require('../helper');
var User = require('../models/user');


router.get('/view',authenticate.verifyToken,(req,res,next)=>{ // authenticate the user and adds the userid in req.user
    console.log(req.user);
    var id = req.user;
    Profile.findOne({userId: id}) // finding the profile that matches the user id
    .then((rsp)=>{
        res.statusCode = 200;
        res.json(rsp)
    })
    .catch((err)=>{
        next(err)
    })
})
router.post('/edit',authenticate.verifyToken,async(req,res,next)=>{
    let f=1;
    if(req.body["email"]){  // checks if email need to be edited
        let user = await User.findById(req.user);
        if(user.email !== req.body['email']){  //if both current and previous email is same then do nothing
            let checkUser = await User.findOne({email: req.body.email});
            if(checkUser){    // if user with email is present then conflict occurs
                f=0;
                let error = new Error("User with same email id already exist")
                error.status = 409
                next(error) //conflict user with same email already exist
            }
            else{ // else email if updated
                User.findOneAndUpdate({_id: req.user},{email: req.body.email})
                .then((s)=>{
                    console.log("email updated");
                })
                .catch((err)=>{
                    console.log("email ",err)
                    next(err)
                })
            }
        }
    }
    if(req.body['password']){
        let hashpassword = await authenticate.createPasswordHash(req.body.password); // create a hash of the new password
        User.findByIdAndUpdate(req.user,{password: hashpassword})
        .then((s)=>{
            console.log("Password updated");
        })
        .catch((err)=>{
            console.log("password ",err)
            next(err)
        })
    }
    if(req.body['phone']){
        await User.findByIdAndUpdate(req.user,{phone: req.body['phone']})
    }
    let updatePayload = new Object();
    helper.validate.profile.map((each)=>{
        updatePayload[each] = req.body[each]
    })
    if(f){
        Profile.findOneAndUpdate({userId: req.user},updatePayload,{new:true}) // finally updates the profile using helper
        .then((rsp)=>{
            console.log("Profile successsfully updated");
            res.statusCode= 200;
            res.json(rsp)
        })
        .catch((err)=>{
            next(err)
        })
    }
})

router.get('/publicProfiles',authenticate.verifyToken,async(req,res,next)=>{ // if the user is valid then they can see the public profiles only
    Profile.find({visibility: true}).exec()
    .then((rsp)=>{
        res.statusCode =200;
        res.json(rsp);
    })
    .catch((err)=>{
        next(err)
    })
})

// to access the private route then the user should be logged in and admin at the same time
router.get('/privateProfiles',authenticate.verifyToken,authenticate.verifyAdmin,async(req,res,next)=>{
    Profile.find({visibility:false}).exec() 
    .then((rsp)=>{
        res.statusCode =200;
        res.json(rsp);
    })
    .catch((err)=>{
        next(err)
    })
})

router.post('/setVisibility',authenticate.verifyToken,async(req,res,next)=>{
    let visibility = req.body.visibility;  // visibility is set according to given request data
    Profile.findOneAndUpdate({userId: req.user},{visibility:visibility})
    .then((rsp)=>{
        res.statusCode = 200;
        let op = visibility ? "Public" : "Private"
        res.send({message:`Changed to ${op}`});
    })
    .catch((err)=>{
        next(err);
    })
})

module.exports = router;