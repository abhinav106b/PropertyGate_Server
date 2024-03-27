const express = require('express');
var router = express.Router();
const bosyParser = require('body-parser');
router.use(bosyParser.json());
var authenticate = require('../authenticate')
var Profile = require('../models/profile')
const helper = require('../helper');
var User = require('../models/user');


router.get('/view',authenticate.verifyToken,(req,res,next)=>{
    console.log(req.user);
    var id = req.user;
    Profile.findOne({userId: id})
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
    if(req.body["email"]){
        let user = await User.findById(req.user);
        if(user.email !== req.body['email']){
            let checkUser = await User.findOne({email: req.body.email});
            if(checkUser){
                f=0;
                let error = new Error("User with same email id already exist")
                error.status = 409
                next(error) //conflict user with same email already exist
            }
            else{
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
        let hashpassword = await authenticate.createPasswordHash(req.body.password);
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
        Profile.findOneAndUpdate({userId: req.user},updatePayload,{new:true})
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

router.get('/publicProfiles',authenticate.verifyToken,async(req,res,next)=>{
    Profile.find({visibility: true}).exec()
    .then((rsp)=>{
        res.statusCode =200;
        res.json(rsp);
    })
    .catch((err)=>{
        next(err)
    })
})

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
    let visibility = req.body.visibility;
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